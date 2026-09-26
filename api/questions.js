const questions = require("./_data/questions");

const TIME_PER_QUESTION = 45; // seconds

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  // Strip correctIndex before sending to the client.
  const safeQuestions = questions.map((q) => ({
    id: q.id,
    category: q.category,
    question: q.question,
    options: q.options,
  }));

  res.status(200).json({
    timePerQuestion: TIME_PER_QUESTION,
    questions: safeQuestions,
  });
};
