const StudentSessionRepo = require("../repositories/StudentSessionRepository");
const { generateExplanationForWrongAnswer } = require("../services/geminiService");

function setsEqual(a, b) {
  if (a.length !== b.length) return false;
  const s = new Set(a);
  for (const x of b) if (!s.has(x)) return false;
  return true;
}

module.exports = {
  async explainWrongAnswer(req, res) {
    try {
      const studentId = req.user.id;
      const { sessionId, questionId } = req.body;

      if (!sessionId || !questionId) {
        return res.status(400).json({ error: "sessionId și questionId sunt obligatorii." });
      }

      // verificăm că studentul chiar e în sesiune
      const data = await StudentSessionRepo.getStudentSession(sessionId, studentId);
      if (!data || !data.session || !data.studentSession) {
        return res.status(404).json({ error: "Sesiunea nu există." });
      }

      const { session, studentSession } = data;

      // întrebările din quiz-ul sesiunii
      const questions = await StudentSessionRepo.getQuizQuestions(session.id);
      const q = questions.find((x) => Number(x.id) === Number(questionId));
      if (!q) {
        return res.status(404).json({ error: "Întrebarea nu aparține acestui quiz." });
      }

      // trebuie să fi răspuns
      const answered = await StudentSessionRepo.hasAnswered(studentSession.id, q.id);
      if (!answered) {
        return res.status(400).json({ error: "Nu ai răspuns încă la această întrebare." });
      }

      const correctIds = await StudentSessionRepo.getCorrectOptionIds(q.id);
      const selectedIds = await StudentSessionRepo.getSelectedOptionIds(studentSession.id, q.id);

      // verificăm dacă e greșit
      const isCorrect = setsEqual(
        correctIds.map(Number).sort((a, b) => a - b),
        (selectedIds || []).map(Number).sort((a, b) => a - b)
      );

      if (isCorrect) {
        return res.status(400).json({ error: "Răspunsul este deja corect. Nu ai nevoie de explicație." });
      }

      const allOptions = await StudentSessionRepo.getQuestionOptions(q.id);
      const optionTexts = allOptions.map((o) => o.text);

      const correctTexts = await StudentSessionRepo.getOptionTexts(correctIds);
      const selectedTexts = await StudentSessionRepo.getOptionTexts(selectedIds || []);

      const explanation = await generateExplanationForWrongAnswer({
        questionTitle: q.title,
        questionType: q.question_type,
        options: optionTexts,
        selectedOptions: selectedTexts.map((x) => x.text),
        correctOptions: correctTexts.map((x) => x.text),
      });

      return res.json({
        success: true,
        session_id: session.id,
        question_id: q.id,
        explanation,
        selected_options: selectedTexts.map((x) => x.text),
        correct_options: correctTexts.map((x) => x.text),
      });
    } catch (err) {
      console.error("STUDENT AI EXPLAIN ERROR:", err);
      return res.status(500).json({ error: err.message || "AI explain failed" });
    }
  },
};