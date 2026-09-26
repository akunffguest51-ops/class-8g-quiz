const { getSupabaseAdmin } = require("./_lib/supabase");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("submissions")
      .select("id, name, score, correct, elapsed, created_at")
      .eq("clean", true)
      .order("score", { ascending: false })
      .order("elapsed", { ascending: true })
      .limit(50);

    if (error) throw error;

    res.status(200).json({ leaderboard: data });
  } catch (err) {
    console.error("leaderboard error:", err);
    res.status(500).json({ error: "Gagal mengambil leaderboard." });
  }
};
