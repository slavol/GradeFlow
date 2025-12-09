const QuizRepository = require("../repositories/QuizRepository");
const QuestionRepository = require("../repositories/QuestionRepository");

module.exports = {
  addMultipleQuestions: async (req, res) => {
    try {
      const professorId = req.user.id;
      const quizId = req.params.quizId;

      const { questions } = req.body;

      if (!questions || !Array.isArray(questions) || questions.length === 0) {
        return res.status(400).json({ message: "Missing or empty questions array" });
      }

      // 1️⃣ Verificăm dacă quiz-ul aparține profesorului
      const quiz = await QuizRepository.findById(quizId, professorId);

      if (!quiz) {
        return res.status(403).json({ message: "Nu ai acces la acest quiz." });
      }

      // 2️⃣ Salvăm întrebările + opțiunile
      const savedQuestions = [];

      for (const q of questions) {
        if (!q.title || !q.question_type) {
          return res.status(400).json({
            message: "Each question must have title and question_type"
          });
        }

        // Creăm întrebarea
        const question = await QuestionRepository.createQuestion(
          quizId,
          q.title,
          q.question_type
        );

        question.options = [];

        // Opțiunile întrebării
        if (Array.isArray(q.options)) {
          for (const opt of q.options) {
            if (!opt.text) continue;

            const option = await QuestionRepository.addOption(
              question.id,
              opt.text,
              Boolean(opt.is_correct)
            );

            question.options.push(option);
          }
        }

        savedQuestions.push(question);
      }

      // 3️⃣ Returnăm întrebările complete
      return res.json({
        message: "Questions created successfully",
        count: savedQuestions.length,
        questions: savedQuestions
      });

    } catch (err) {
      console.error("QUESTION ERROR:", err);
      return res.status(500).json({ message: "Server error" });
    }
  }
};