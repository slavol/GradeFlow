const QuestionRepository = require("../repositories/QuestionRepository");

module.exports = {
  createQuestion: async (req, res) => {
    try {
      const { quizId } = req.params;
      const { title, question_type } = req.body;

      if (!title || !question_type) {
        return res.status(400).json({ message: "title și question_type sunt obligatorii" });
      }

      const question = await QuestionRepository.create(
        quizId,
        title,
        question_type
      );

      res.json({ message: "Question created", question });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  },

  listQuestions: async (req, res) => {
    try {
      const { quizId } = req.params;

      const questions = await QuestionRepository.getByQuizId(quizId);
      res.json(questions);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  },

  deleteQuestion: async (req, res) => {
    try {
      const { questionId } = req.params;
      const { quizId } = req.params;

      await QuestionRepository.delete(questionId, quizId);

      res.json({ message: "Question deleted" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }
};