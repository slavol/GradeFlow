const pool = require("../db/database");

class QuestionRepository {
  static async createQuestion(quizId, title, question_type) {
    const result = await pool.query(
      `INSERT INTO questions (quiz_id, title, question_type)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [quizId, title, question_type]
    );
    return result.rows[0];
  }

  static async addOption(questionId, text, is_correct) {
    const result = await pool.query(
      `INSERT INTO options (question_id, text, is_correct)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [questionId, text, is_correct]
    );
    return result.rows[0];
  }
}

module.exports = QuestionRepository;