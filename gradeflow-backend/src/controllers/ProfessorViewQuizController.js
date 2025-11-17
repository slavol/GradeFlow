const pool = require("../db/database");

module.exports = {
  getQuizDetails: async (req, res) => {
    try {
      const quizId = req.params.id;
      const professorId = req.user.id;

      // Verify quiz belongs to professor
      const quizResult = await pool.query(
        `SELECT * FROM quizzes WHERE id = $1 AND professor_id = $2`,
        [quizId, professorId]
      );

      if (quizResult.rows.length === 0) {
        return res.status(404).json({ message: "Quiz not found" });
      }

      const quiz = quizResult.rows[0];

      // Get questions
      const questionsRes = await pool.query(
        `SELECT * FROM questions WHERE quiz_id = $1 ORDER BY id ASC`,
        [quizId]
      );

      const questions = questionsRes.rows;

      // Get options for all questions
      const questionIds = questions.map((q) => q.id);

      let options = [];
      if (questionIds.length > 0) {
        const optRes = await pool.query(
          `SELECT * FROM options WHERE question_id = ANY($1::int[]) ORDER BY id ASC`,
          [questionIds]
        );
        options = optRes.rows;
      }

      // Merge options inside each question
      const fullQuestions = questions.map((q) => ({
        ...q,
        options: options.filter((o) => o.question_id === q.id),
      }));

      res.json({
        quiz,
        questions: fullQuestions,
      });

    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }
};