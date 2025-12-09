const QuestionRepository = require("../repositories/QuestionRepository");
const pool = require("../db/database");

module.exports = {
  updateQuestions: async (req, res) => {
    try {
      const quizId = req.params.id;
      const { questions } = req.body;

      if (!Array.isArray(questions)) {
        return res.status(400).json({ message: "Invalid questions format" });
      }

      console.log("🔄 Updating questions for quiz:", quizId);
      console.log("📚 Received:", questions.length, "questions");

      // 1️⃣ Ștergem întrebările existente
      await pool.query(`DELETE FROM questions WHERE quiz_id = $1`, [quizId]);

      // 2️⃣ Le recreăm în ordinea corectă
      for (let index = 0; index < questions.length; index++) {
        const q = questions[index];

        // Creăm întrebarea
        const newQ = await QuestionRepository.createQuestion(
          quizId,
          q.title,
          q.question_type
        );

        // Setăm poziția (notă: createQuestion nu o setează)
        await pool.query(
          `UPDATE questions SET position = $1 WHERE id = $2`,
          [index, newQ.id]
        );

        // Adăugăm opțiunile
        if (Array.isArray(q.options)) {
          for (const opt of q.options) {
            await QuestionRepository.addOption(
              newQ.id,
              opt.text,
              Boolean(opt.is_correct)
            );
          }
        }
      }

      return res.json({ message: "Questions updated successfully" });

    } catch (err) {
      console.error("❌ Error updating questions:", err);
      res.status(500).json({ message: "Server error" });
    }
  },

  addFullQuestions: async (req, res) => {
    try {
      const quizId = req.params.id;
      const { questions } = req.body;

      if (!questions || !Array.isArray(questions)) {
        return res.status(400).json({ message: "questions must be an array" });
      }

      const saved = [];

      for (const q of questions) {
        const question = await QuestionRepository.createQuestion(
          quizId,
          q.title,
          q.question_type
        );

        if (Array.isArray(q.options)) {
          for (const opt of q.options) {
            await QuestionRepository.addOption(
              question.id,
              opt.text,
              opt.is_correct
            );
          }
        }

        saved.push(question);
      }

      res.json({
        message: "Questions created",
        count: saved.length,
        questions: saved,
      });

    } catch (err) {
      console.error("❌ addFullQuestions ERROR:", err);
      res.status(500).json({ message: "Server error" });
    }
  }
};