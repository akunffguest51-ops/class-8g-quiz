const questions = require("./_data/questions");
const { getSupabaseAdmin } = require("./_lib/supabase");

const TIME_PER_QUESTION = 45; // seconds, must match api/questions.js
const TOTAL_ALLOWED_TIME = questions.length * TIME_PER_QUESTION;
const MAX_NICKNAME_LEN = 20;

function sanitizeNickname(raw) {
  if (typeof raw !== "string") return "Player";
  const cleaned = raw.trim().replace(/[<>]/g, "").slice(0, MAX_NICKNAME_LEN);
  return cleaned.length > 0 ? cleaned : "Player";
}

function isValidAnswersArray(answers) {
  return (
    Array.isArray(answers) &&
    answers.length === questions.length &&
    answers.every(
      (a) => a === null || (Number.isInteger(a) && a >= 0 && a <= 3)
    )
  );
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      res.status(400).json({ error: "Invalid JSON body" });
      return;
    }
  }
  if (!body || typeof body !== "object") {
    res.status(400).json({ error: "Missing body" });
    return;
  }

  const { nickname, answers, elapsed, violations, violation_events } = body;

  if (!isValidAnswersArray(answers)) {
    res.status(400).json({ error: "Invalid answers payload" });
    return;
  }

  const name = sanitizeNickname(nickname);

  const elapsedSeconds = Number.isFinite(Number(elapsed))
    ? Math.max(0, Math.min(Number(elapsed), TOTAL_ALLOWED_TIME * 3))
    : TOTAL_ALLOWED_TIME;

  const violationCount = Number.isInteger(violations)
    ? Math.max(0, violations)
    : 0;

  const violationEvents = Array.isArray(violation_events)
    ? violation_events.filter((e) => typeof e === "string").slice(0, 50)
    : [];

  // Server recomputes correctness from the answer key. Never trust a client-sent score.
  let correct = 0;
  answers.forEach((ans, i) => {
    if (ans !== null && ans === questions[i].correctIndex) correct += 1;
  });

  const disqualified = violationCount >= 2;
  const flagged = !disqualified && violationCount > 0;

  let score = 0;
  if (!disqualified) {
    const speedBonus = Math.max(0, TOTAL_ALLOWED_TIME - elapsedSeconds);
    score = correct * 100 + Math.round(speedBonus);
  }

  const status = disqualified ? "DISQUALIFIED" : flagged ? "FLAGGED" : "CLEAN";
  const clean = status === "CLEAN";

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("submissions")
      .insert({
        name,
        correct,
        elapsed: elapsedSeconds,
        violations: violationCount,
        violation_events: violationEvents,
        score,
        clean,
        status,
      })
      .select("id, created_at")
      .single();

    if (error) throw error;

    res.status(200).json({
      ok: true,
      id: data.id,
      status,
      clean,
      score,
      correct,
      total: questions.length,
      elapsed: elapsedSeconds,
    });
  } catch (err) {
    console.error("submit error:", err);
    res.status(500).json({ error: "Gagal menyimpan submission." });
  }
};
