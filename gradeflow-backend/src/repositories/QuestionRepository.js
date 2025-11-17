const pool = require("../db/database");

class QuestionRepository {
  
  static async createQuestion(quizId, title, question_type) {
    const res = await pool.query(
      `INSERT INTO questions (quiz_id, title, question_type)
       VALUES ($1,$2,$3)
       RETURNING *`,
      [quizId, title, question_type]
    );
    return res.rows[0];
  }

  static async addOption(questionId, text, isCorrect) {
    await pool.query(
      `INSERT INTO options (question_id, text, is_correct)
       VALUES ($1,$2,$3)`,
      [questionId, text, isCorrect]
    );
  }

  static async getQuestionsWithOptions(quizId) {
    const questionsRes = await pool.query(
      `SELECT * FROM questions WHERE quiz_id = $1 ORDER BY id`,
      [quizId]
    );

    const questions = questionsRes.rows;

    for (let q of questions) {
      const opts = await pool.query(
        `SELECT * FROM options WHERE question_id = $1 ORDER BY id`,
        [q.id]
      );
      q.options = opts.rows;
    }

    return questions;
  }

  static async deleteAllByQuizId(quizId) {
    await pool.query(`DELETE FROM questions WHERE quiz_id = $1`, [quizId]);
  }
}

module.exports = QuestionRepository;