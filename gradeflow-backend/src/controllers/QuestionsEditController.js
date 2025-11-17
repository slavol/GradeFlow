const QuestionRepository = require("../repositories/QuestionRepository");

module.exports = {
  updateQuestions: async (req, res) => {
    try {
      const quizId = req.params.id;
      const { questions } = req.body;

      // 1. șterge toate întrebările existente
      await QuestionRepository.deleteAllByQuizId(quizId);

      // 2. recreează întrebările
      for (const q of questions) {
        const newQ = await QuestionRepository.createQuestion(
          quizId,
          q.title,
          q.question_type
        );

        for (const opt of q.options) {
          await QuestionRepository.addOption(newQ.id, opt.text, opt.is_correct);
        }
      }

      res.json({ message: "Questions updated" });

    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }
};