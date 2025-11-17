const QuestionRepository = require("../repositories/QuestionRepository");

module.exports = {
  addMultipleQuestions: async (req, res) => {
    try {
      const professorId = req.user.id;
      const quizId = req.params.quizId;

      console.log("RECEIVED QUIZ ID:", quizId);
      console.log("REQUEST BODY:", req.body);

      const { questions } = req.body;

      if (!questions || !Array.isArray(questions) || questions.length === 0) {
        return res.status(400).json({ message: "Missing or empty questions array" });
      }

      const savedQuestions = [];

      for (const q of questions) {
        if (!q.title || !q.question_type) {
          return res.status(400).json({ message: "Each question must have title and question_type" });
        }

        const question = await QuestionRepository.createQuestion(
          quizId,
          q.title,
          q.question_type
        );

        // Add options
        for (const opt of q.options) {
          await QuestionRepository.addOption(
            question.id,
            opt.text,
            opt.is_correct
          );
        }

        savedQuestions.push(question);
      }

      res.json({
        message: "Questions created successfully",
        count: savedQuestions.length,
        questions: savedQuestions
      });

    } catch (err) {
      console.error("QUESTION ERROR:", err);
      res.status(500).json({ message: "Server error" });
    }
  }
};