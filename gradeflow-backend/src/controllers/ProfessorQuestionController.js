const QuestionRepository = require("../repositories/QuestionRepository");

module.exports = {

  // ----------------------------------------------------
  // CREATE SINGLE QUESTION
  // ----------------------------------------------------
  createQuestion: async (req, res) => {
    try {
      const { quizId } = req.params;
      const { title, question_type } = req.body;

      if (!title || !question_type) {
        return res
          .status(400)
          .json({ message: "title și question_type sunt obligatorii." });
      }

      if (!["single", "multiple"].includes(question_type)) {
        return res.status(400).json({ message: "question_type invalid." });
      }

      const question = await QuestionRepository.createQuestion(
        quizId,
        title,
        question_type
      );

      res.json({
        message: "Question created",
        question,
      });
    } catch (err) {
      console.error("CREATE QUESTION ERROR:", err);
      res.status(500).json({ message: "Server error" });
    }
  },

  // ----------------------------------------------------
  // ADD MULTIPLE QUESTIONS AT ONCE
  // ----------------------------------------------------
  addMultipleQuestions: async (req, res) => {
    try {
      const { quizId } = req.params;
      const { questions } = req.body;

      if (!questions || !Array.isArray(questions) || questions.length === 0) {
        return res.status(400).json({ message: "Missing or empty questions array" });
      }

      const savedQuestions = [];

      for (const q of questions) {
        if (!q.title || !q.question_type) {
          return res
            .status(400)
            .json({ message: "Each question must have title and question_type" });
        }

        const newQuestion = await QuestionRepository.createQuestion(
          quizId,
          q.title,
          q.question_type
        );

        if (Array.isArray(q.options)) {
          for (const opt of q.options) {
            await QuestionRepository.addOption(
              newQuestion.id,
              opt.text,
              opt.is_correct
            );
          }
        }

        savedQuestions.push(newQuestion);
      }

      res.json({
        message: "Questions created successfully",
        count: savedQuestions.length,
        questions: savedQuestions,
      });
    } catch (err) {
      console.error("ADD MULTIPLE QUESTIONS ERROR:", err);
      res.status(500).json({ message: "Server error" });
    }
  },

  // ----------------------------------------------------
  // LIST QUESTIONS + OPTIONS
  // ----------------------------------------------------
  listQuestions: async (req, res) => {
    try {
      const { quizId } = req.params;

      const questions = await QuestionRepository.getQuestionsWithOptions(quizId);

      res.json(questions);
    } catch (err) {
      console.error("LIST QUESTIONS ERROR:", err);
      res.status(500).json({ message: "Server error" });
    }
  },

  // ----------------------------------------------------
  // DELETE QUESTION
  // ----------------------------------------------------
  deleteQuestion: async (req, res) => {
    try {
      const { questionId } = req.params;

      await QuestionRepository.deleteQuestion(questionId);

      res.json({ message: "Question deleted" });
    } catch (err) {
      console.error("DELETE QUESTION ERROR:", err);
      res.status(500).json({ message: "Server error" });
    }
  },
};