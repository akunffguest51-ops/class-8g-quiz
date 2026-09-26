// quiz.js — quiz flow, timer, and browser-side anti-cheat detection.
//
// IMPORTANT LIMITATION: this only detects behaviour the browser can observe.
// A determined user with browser devtools/extensions can bypass client-side
// checks entirely. The server (api/submit.js) is the source of truth for the
// score and never trusts numbers sent from here — but the *violation count*
// itself is reported by the client, so treat this anti-cheat layer as a
// deterrent for a classroom setting, not a hardened proctoring system.

(function () {
  const nickname = sessionStorage.getItem("c8g_nickname");
  if (!nickname) {
    window.location.href = "/index.html";
    return;
  }

  // --- Reload / back-navigation mid-quiz detection ---
  if (sessionStorage.getItem("quiz_active") === "true") {
    sessionStorage.removeItem("quiz_active");
    sessionStorage.removeItem("quiz_state");
    sessionStorage.setItem("c8g_dq_reason", "reload");
    window.location.href = "/index.html?dq=reload";
    return;
  }
  sessionStorage.setItem("quiz_active", "true");

  const els = {
    progressPill: document.getElementById("progress-pill"),
    progressFill: document.getElementById("progress-fill"),
    timer: document.getElementById("timer"),
    categoryTag: document.getElementById("category-tag"),
    questionText: document.getElementById("question-text"),
    options: document.getElementById("options"),
    nextBtn: document.getElementById("next-btn"),
    warnOverlay: document.getElementById("warn-overlay"),
    violationCounter: document.getElementById("violation-counter"),
    warnContinueBtn: document.getElementById("warn-continue-btn"),
    dqOverlay: document.getElementById("dq-overlay"),
  };

  let questions = [];
  let timePerQuestion = 45;
  let currentIndex = 0;
  let answers = [];
  let violations = 0;
  let violationEvents = [];
  let remaining = 45;
  let timerHandle = null;
  let quizStartTime = null;
  let finished = false;
  let lastViolationAt = 0;
  let devtoolsOpen = false;

  function fmtTime(s) {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  }

  function registerViolation(reason) {
    if (finished) return;
    const now = Date.now();
    if (now - lastViolationAt < 800) return; // debounce related events
    lastViolationAt = now;

    violations += 1;
    violationEvents.push(reason);

    if (violations === 1) {
      els.violationCounter.textContent = "Violation 1/2";
      els.warnOverlay.classList.add("show");
    } else if (violations >= 2) {
      disqualify();
    }
  }

  function disqualify() {
    if (finished) return;
    finished = true;
    clearInterval(timerHandle);
    els.warnOverlay.classList.remove("show");
    els.dqOverlay.classList.add("show");
    submitQuiz(true).then(() => {
      setTimeout(() => {
        window.location.href = "/result.html";
      }, 1600);
    });
  }

  els.warnContinueBtn.addEventListener("click", () => {
    els.warnOverlay.classList.remove("show");
  });

  // --- Anti-cheat listeners ---
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) registerViolation("tab_switch_or_hidden");
  });
  window.addEventListener("blur", () => {
    if (!document.hidden) registerViolation("window_focus_lost");
  });
  document.addEventListener("copy", (e) => {
    e.preventDefault();
    registerViolation("copy_attempt");
  });
  document.addEventListener("cut", (e) => {
    e.preventDefault();
    registerViolation("cut_attempt");
  });
  document.addEventListener("paste", (e) => {
    e.preventDefault();
    registerViolation("paste_attempt");
  });
  document.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    registerViolation("right_click");
  });
  document.addEventListener("keydown", (e) => {
    const blockedCombo =
      (e.ctrlKey || e.metaKey) &&
      ["c", "v", "x", "u", "s", "p"].includes(e.key.toLowerCase());
    const devtoolsCombo =
      e.key === "F12" ||
      ((e.ctrlKey || e.metaKey) && e.shiftKey && ["I", "J", "C", "i", "j", "c"].includes(e.key));
    if (blockedCombo || devtoolsCombo) {
      e.preventDefault();
      registerViolation(devtoolsCombo ? "devtools_shortcut" : "clipboard_shortcut");
    }
  });
  document.addEventListener("fullscreenchange", () => {
    if (!document.fullscreenElement && quizStartTime) {
      registerViolation("fullscreen_exit");
    }
  });
  window.addEventListener("beforeunload", (e) => {
    if (!finished) {
      e.preventDefault();
      e.returnValue = "";
    }
  });

  // Heuristic devtools-open detector (docked panel changes viewport size).
  setInterval(() => {
    if (finished) return;
    const widthDiff = window.outerWidth - window.innerWidth;
    const heightDiff = window.outerHeight - window.innerHeight;
    const suspected = widthDiff > 160 || heightDiff > 160;
    if (suspected && !devtoolsOpen) {
      devtoolsOpen = true;
      registerViolation("devtools_suspected");
    } else if (!suspected) {
      devtoolsOpen = false;
    }
  }, 1000);

  // --- Timer ---
  function startTimer() {
    remaining = timePerQuestion;
    updateTimerDisplay();
    clearInterval(timerHandle);
    timerHandle = setInterval(() => {
      remaining -= 1;
      updateTimerDisplay();
      if (remaining <= 0) {
        clearInterval(timerHandle);
        goNext();
      }
    }, 1000);
  }

  function updateTimerDisplay() {
    els.timer.textContent = fmtTime(Math.max(0, remaining));
    els.timer.classList.toggle("warn", remaining <= 10);
  }

  // --- Rendering ---
  function renderQuestion() {
    const q = questions[currentIndex];
    els.progressPill.textContent = `Soal ${currentIndex + 1} / ${questions.length}`;
    els.progressFill.style.width = `${((currentIndex + 1) / questions.length) * 100}%`;
    els.categoryTag.textContent = q.category;
    els.questionText.textContent = q.question;
    els.options.innerHTML = "";

    const letters = ["A", "B", "C", "D"];
    q.options.forEach((optText, idx) => {
      const btn = document.createElement("button");
      btn.className = "option";
      btn.innerHTML = `<span class="letter">${letters[idx]}</span><span>${optText}</span>`;
      btn.addEventListener("click", () => selectOption(idx));
      els.options.appendChild(btn);
    });

    els.nextBtn.disabled = answers[currentIndex] === null;
    els.nextBtn.textContent = currentIndex === questions.length - 1 ? "FINISH →" : "NEXT →";
    markSelected();
    startTimer();
  }

  function markSelected() {
    const opts = els.options.querySelectorAll(".option");
    opts.forEach((opt, idx) => {
      opt.classList.toggle("selected", answers[currentIndex] === idx);
    });
  }

  function selectOption(idx) {
    answers[currentIndex] = idx;
    markSelected();
    els.nextBtn.disabled = false;
  }

  function goNext() {
    if (finished) return;
    if (currentIndex < questions.length - 1) {
      currentIndex += 1;
      renderQuestion();
    } else {
      finishQuiz();
    }
  }

  els.nextBtn.addEventListener("click", goNext);

  async function finishQuiz() {
    if (finished) return;
    finished = true;
    clearInterval(timerHandle);
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    await submitQuiz(false);
    window.location.href = "/result.html";
  }

  async function submitQuiz(disqualified) {
    const elapsedSeconds = quizStartTime
      ? Math.round((Date.now() - quizStartTime) / 1000)
      : questions.length * timePerQuestion;

    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nickname,
          answers,
          elapsed: elapsedSeconds,
          violations,
          violation_events: violationEvents,
        }),
      });
      const data = await res.json();
      sessionStorage.setItem("c8g_result", JSON.stringify(data));
    } catch (err) {
      sessionStorage.setItem(
        "c8g_result",
        JSON.stringify({ ok: false, error: "network_error" })
      );
    } finally {
      sessionStorage.removeItem("quiz_active");
      sessionStorage.removeItem("quiz_state");
    }
  }

  // --- Boot ---
  async function boot() {
    try {
      const res = await fetch("/api/questions");
      const data = await res.json();
      questions = data.questions;
      timePerQuestion = data.timePerQuestion || 45;
      answers = new Array(questions.length).fill(null);

      // Try to enter fullscreen (best effort; may silently fail on some browsers).
      const docEl = document.documentElement;
      if (docEl.requestFullscreen) {
        docEl.requestFullscreen().catch(() => {});
      }

      quizStartTime = Date.now();
      renderQuestion();
    } catch (err) {
      els.questionText.textContent =
        "Gagal memuat soal. Periksa koneksi lalu muat ulang halaman.";
    }
  }

  boot();
})();
