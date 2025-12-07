const QuizRepository = require("../repositories/QuizRepository");
const QuestionRepository = require("../repositories/QuestionRepository");
const SessionRepository = require("../repositories/SessionRepository");

module.exports = {
  createQuiz: async (req, res) => {
    try {
      const professorId = req.user.id;
      const { title, description, timeLimit, creation_type } = req.body;

      const quiz = await QuizRepository.create(
        professorId,
        title,
        description || "",
        timeLimit || 0,
        creation_type
      );

      res.json({ message: "Quiz created", quiz });
    } catch (err) {
      console.error("❌ createQuiz error:", err);
      res.status(500).json({ message: "Server error" });
    }
  },

  listQuizzes: async (req, res) => {
    try {
      const professorId = req.user.id;
      const quizzes = await QuizRepository.getByProfessorId(professorId);
      res.json(quizzes);
    } catch (err) {
      console.error("❌ listQuizzes error:", err);
      res.status(500).json({ message: "Server error" });
    }
  },

  deleteQuiz: async (req, res) => {
    try {
      const professorId = req.user.id;
      const quizId = req.params.id;

      await QuizRepository.delete(quizId, professorId);
      res.json({ message: "Quiz deleted" });
    } catch (err) {
      console.error("❌ deleteQuiz error:", err);
      res.status(500).json({ message: "Server error" });
    }
  },

  getQuizById: async (req, res) => {
    try {
      const quizId = req.params.id;
      const professorId = req.user.id;

      console.log("🔍 VIEW QUIZ", { quizId, professorId });

      const quiz = await QuizRepository.findById(quizId, professorId);

      if (!quiz) {
        console.log("⚠️ QUIZ NOT FOUND!");
        return res.status(404).json({ message: "Quiz inexistent" });
      }

      const questions = await QuestionRepository.getQuestionsWithOptions(quizId);

      res.json({
        ...quiz,
        questions,
      });

    } catch (err) {
      console.error("❌ getQuizById error:", err);
      res.status(500).json({ message: "Server error" });
    }
  },

  updateQuiz: async (req, res) => {
    try {
      const quizId = req.params.id;
      const professorId = req.user.id;

      const { title, description, time_limit } = req.body;

      const updated = await QuizRepository.updateQuizMeta(
        quizId,
        professorId,
        title,
        description,
        time_limit
      );

      res.json({ message: "Quiz updated", quiz: updated });

    } catch (err) {
      console.error("❌ updateQuiz error:", err);
      res.status(500).json({ message: "Server error" });
    }
  },

  startSession: async (req, res) => {
    try {
      const quizId = req.params.id;
      const professorId = req.user.id;

      const session = await SessionRepository.createSession(quizId, professorId);

      res.json({
        message: "Session started",
        session
      });

    } catch (err) {
      console.error("❌ startSession error:", err);
      res.status(500).json({ message: "Server error" });
    }
  }
};