(function () {
  const loginCard = document.getElementById("login-card");
  const dashCard = document.getElementById("dashboard-card");
  const keyInput = document.getElementById("admin-key");
  const loginBtn = document.getElementById("login-btn");
  const loginError = document.getElementById("login-error");
  const refreshBtn = document.getElementById("refresh-btn");
  const logoutBtn = document.getElementById("logout-btn");
  const totalPill = document.getElementById("total-pill");
  const body = document.getElementById("admin-body");

  let adminKey = sessionStorage.getItem("c8g_admin_key") || "";

  function fmtTime(totalSeconds) {
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
    const s = Math.floor(totalSeconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }

  function badgeFor(status) {
    const cls =
      status === "CLEAN" ? "clean" : status === "FLAGGED" ? "flagged" : "disqualified";
    const label = status === "CLEAN" ? "🟢 CLEAN" : status === "FLAGGED" ? "🟡 FLAGGED" : "🔴 DISQUALIFIED";
    return `<span class="badge ${cls}">${label}</span>`;
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  async function loadData() {
    try {
      const res = await fetch(`/api/admin?key=${encodeURIComponent(adminKey)}`, {
        headers: { "x-admin-key": adminKey },
      });
      if (res.status === 401) {
        sessionStorage.removeItem("c8g_admin_key");
        loginCard.style.display = "block";
        dashCard.style.display = "none";
        logoutBtn.style.display = "none";
        loginError.textContent = "Admin key salah.";
        loginError.style.display = "block";
        return;
      }
      const data = await res.json();
      const rows = data.submissions || [];
      totalPill.textContent = `${rows.length} submissions`;
      body.innerHTML = rows
        .map((r) => {
          const events = (r.violation_events || [])
            .map((e) => `<li>${escapeHtml(e)}</li>`)
            .join("");
          return `<tr>
            <td>${r.id.slice(0, 8)}</td>
            <td>${escapeHtml(r.name)}</td>
            <td>${r.score}</td>
            <td>${r.correct}</td>
            <td>${fmtTime(r.elapsed)}</td>
            <td>${r.violations}${events ? `<ul class="events-list">${events}</ul>` : ""}</td>
            <td>${badgeFor(r.status)}</td>
            <td>${new Date(r.created_at).toLocaleString("id-ID")}</td>
          </tr>`;
        })
        .join("");

      loginCard.style.display = "none";
      dashCard.style.display = "block";
      logoutBtn.style.display = "inline-flex";
    } catch (err) {
      loginError.textContent = "Gagal memuat data admin.";
      loginError.style.display = "block";
    }
  }

  loginBtn.addEventListener("click", () => {
    const val = keyInput.value.trim();
    if (!val) {
      loginError.textContent = "Admin key tidak boleh kosong.";
      loginError.style.display = "block";
      return;
    }
    adminKey = val;
    sessionStorage.setItem("c8g_admin_key", adminKey);
    loginError.style.display = "none";
    loadData();
  });

  keyInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") loginBtn.click();
  });

  refreshBtn.addEventListener("click", loadData);

  logoutBtn.addEventListener("click", () => {
    sessionStorage.removeItem("c8g_admin_key");
    window.location.href = "/index.html";
  });

  if (adminKey) loadData();
})();
