const QuestionRepository = require("../repositories/QuestionRepository");

module.exports = {
  updateQuestions: async (req, res) => {
    try {
      const quizId = req.params.id;
      const { questions } = req.body;

      if (!Array.isArray(questions)) {
        return res.status(400).json({ message: "Invalid question format" });
      }

      console.log("🔄 UPDATE QUESTIONS for quiz:", quizId);
      console.log("📚 Received questions:", questions.length);

      // 1. Șterge toate întrebările existente
      await QuestionRepository.deleteAllByQuizId(quizId);

      // 2. Recreează întrebările în ordinea corectă
      for (let index = 0; index < questions.length; index++) {
        const q = questions[index];

        // poziția este index-ul
        const newQ = await QuestionRepository.createQuestion(
          quizId,
          q.title,
          q.question_type,
          index // position
        );

        // Adaugă opțiuni
        for (const opt of q.options) {
          await QuestionRepository.addOption(
            newQ.id,
            opt.text,
            opt.is_correct
          );
        }
      }

      return res.json({ message: "Questions updated" });

    } catch (err) {
      console.error("❌ Error updating questions:", err);
      res.status(500).json({ message: "Server error" });
    }
  }
};