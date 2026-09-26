(function () {
  const raw = sessionStorage.getItem("c8g_result");

  const icon = document.getElementById("result-icon");
  const title = document.getElementById("result-title");
  const sub = document.getElementById("result-sub");
  const statGrid = document.getElementById("stat-grid");
  const statScore = document.getElementById("stat-score");
  const statCorrect = document.getElementById("stat-correct");
  const statTime = document.getElementById("stat-time");
  const statusLine = document.getElementById("status-line");
  const primaryBtn = document.getElementById("primary-btn");
  const secondaryBtn = document.getElementById("secondary-btn");

  function fmtTime(totalSeconds) {
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
    const s = Math.floor(totalSeconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }

  secondaryBtn.style.display = "inline-flex";
  secondaryBtn.addEventListener("click", () => {
    window.location.href = "/index.html";
  });

  if (!raw) {
    icon.textContent = "❓";
    title.textContent = "Tidak ada hasil";
    title.className = "result-title bad";
    sub.textContent = "Silakan mulai quiz dari halaman awal.";
    return;
  }

  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    data = null;
  }

  if (!data || data.ok === false) {
    icon.textContent = "⚠️";
    title.textContent = "Terjadi kesalahan";
    title.className = "result-title bad";
    sub.textContent = "Submission gagal disimpan. Coba lagi dari halaman awal.";
    return;
  }

  const isClean = data.status === "CLEAN";
  const isDisqualified = data.status === "DISQUALIFIED";

  statGrid.style.display = "grid";
  statScore.textContent = data.score;
  statCorrect.textContent = `${data.correct}/${data.total}`;
  statTime.textContent = fmtTime(data.elapsed);
  statusLine.style.display = "block";

  if (isDisqualified) {
    icon.textContent = "🚫";
    title.textContent = "QUIZ DISQUALIFIED";
    title.className = "result-title bad";
    sub.textContent = "";
    statusLine.className = "status-line bad";
    statusLine.textContent = "Your score will not appear on the leaderboard.";
    primaryBtn.style.display = "none";
  } else if (isClean) {
    icon.textContent = "🏆";
    title.textContent = "SUBMISSION ACCEPTED";
    title.className = "result-title ok";
    sub.textContent = "";
    statusLine.className = "status-line ok";
    statusLine.textContent = "✓ CLEAN — Your score is on the leaderboard.";
    primaryBtn.style.display = "inline-flex";
    primaryBtn.textContent = "VIEW LEADERBOARD";
    primaryBtn.addEventListener("click", () => {
      window.location.href = "/leaderboard.html";
    });
  } else {
    // FLAGGED: finished normally but had 1 violation, so excluded from leaderboard.
    icon.textContent = "⚠️";
    title.textContent = "SUBMISSION FLAGGED";
    title.className = "result-title bad";
    sub.textContent = "";
    statusLine.className = "status-line bad";
    statusLine.textContent =
      "1 pelanggaran terdeteksi selama quiz — skor tidak akan muncul di leaderboard.";
    primaryBtn.style.display = "none";
  }
})();
