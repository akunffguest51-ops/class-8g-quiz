const { getSupabaseAdmin } = require("./_lib/supabase");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const providedKey = req.headers["x-admin-key"] || req.query.key;
  const adminKey = process.env.ADMIN_KEY;

  if (!adminKey) {
    res.status(500).json({ error: "ADMIN_KEY belum diatur di server." });
    return;
  }

  if (!providedKey || providedKey !== adminKey) {
    res.status(401).json({ error: "Admin key salah atau tidak ada." });
    return;
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("submissions")
      .select(
        "id, name, score, correct, elapsed, violations, violation_events, clean, status, created_at"
      )
      .order("created_at", { ascending: false })
      .limit(500);

    if (error) throw error;

    res.status(200).json({ submissions: data });
  } catch (err) {
    console.error("admin error:", err);
    res.status(500).json({ error: "Gagal mengambil data admin." });
  }
};
