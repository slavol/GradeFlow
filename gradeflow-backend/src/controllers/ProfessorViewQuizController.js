const QuizRepository = require("../repositories/QuizRepository");
const QuestionRepository = require("../repositories/QuestionRepository");

module.exports = {
  getQuizDetails: async (req, res) => {
    try {
      const quizId = req.params.id;
      const professorId = req.user.id;

      // 1️⃣ Luăm quiz-ul (validare proprietate)
      const quiz = await QuizRepository.findById(quizId, professorId);

      if (!quiz) {
        return res.status(404).json({ message: "Quiz not found" });
      }

      // 2️⃣ Luăm toate întrebările + opțiunile lor
      const questions = await QuestionRepository.getQuestionsWithOptions(quizId);

      // 3️⃣ Returnăm structura completă
      res.json({
        quiz,
        questions,
      });

    } catch (err) {
      console.error("VIEW QUIZ ERROR:", err);
      res.status(500).json({ message: "Server error" });
    }
  }
};