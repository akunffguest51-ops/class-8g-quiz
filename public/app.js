// index.html logic — nickname entry + navigation
(function () {
  const startBtn = document.getElementById("start-btn");
  const lbBtn = document.getElementById("leaderboard-btn");
  const nicknameInput = document.getElementById("nickname");
  const errorMsg = document.getElementById("error-msg");

  // If a quiz was mid-progress and the page reloaded, sessionStorage still
  // has the "quiz_active" flag. Clear it here so a fresh start is possible.
  // (quiz.html itself uses this flag to detect reload-during-quiz as a violation.)

  function showError(msg) {
    errorMsg.textContent = msg;
    errorMsg.style.display = "block";
  }

  // If we bounced back here because a reload/back-navigation was detected
  // mid-quiz, show a short explanation.
  const params = new URLSearchParams(window.location.search);
  if (params.get("dq") === "reload") {
    showError(
      "Quiz sebelumnya dihentikan karena halaman dimuat ulang / navigasi mundur terdeteksi. Silakan mulai lagi dengan nickname."
    );
    window.history.replaceState({}, "", "/index.html");
  }

  startBtn.addEventListener("click", () => {
    const name = nicknameInput.value.trim();
    if (!name) {
      showError("Nickname tidak boleh kosong.");
      return;
    }
    if (name.length > 20) {
      showError("Nickname maksimal 20 karakter.");
      return;
    }
    sessionStorage.setItem("c8g_nickname", name);
    sessionStorage.removeItem("quiz_active");
    sessionStorage.removeItem("quiz_state");
    window.location.href = "/quiz.html";
  });

  nicknameInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") startBtn.click();
  });

  lbBtn.addEventListener("click", () => {
    window.location.href = "/leaderboard.html";
  });
})();
