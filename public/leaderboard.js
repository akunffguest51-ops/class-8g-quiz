(function () {
  const loading = document.getElementById("lb-loading");
  const table = document.getElementById("lb-table");
  const body = document.getElementById("lb-body");
  const empty = document.getElementById("lb-empty");
  const backBtn = document.getElementById("back-btn");

  backBtn.addEventListener("click", () => {
    window.location.href = "/index.html";
  });

  const medals = ["🥇", "🥈", "🥉"];

  function fmtTime(totalSeconds) {
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
    const s = Math.floor(totalSeconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }

  async function load() {
    try {
      const res = await fetch("/api/leaderboard");
      const data = await res.json();
      const rows = data.leaderboard || [];

      loading.style.display = "none";

      if (rows.length === 0) {
        empty.style.display = "block";
        return;
      }

      table.style.display = "table";
      body.innerHTML = rows
        .map((row, i) => {
          const rankLabel = i < 3 ? medals[i] : `#${i + 1}`;
          const name = escapeHtml(row.name);
          return `<tr>
            <td class="rank-cell">${rankLabel}</td>
            <td>${name}</td>
            <td>${row.score}</td>
            <td>${fmtTime(row.elapsed)}</td>
          </tr>`;
        })
        .join("");
    } catch (err) {
      loading.textContent = "Gagal memuat leaderboard. Coba lagi nanti.";
    }
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  load();
  // Poll every 8 seconds so the leaderboard stays close to real-time.
  setInterval(load, 8000);
})();
