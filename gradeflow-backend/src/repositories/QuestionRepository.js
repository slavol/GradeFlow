const pool = require("../db/database");

class QuestionRepository {
  // ----------------------------------------------------
  // CREATE QUESTION
  // ----------------------------------------------------
  static async createQuestion(quizId, title, question_type, position = 0) {
    const result = await pool.query(
      `INSERT INTO questions (quiz_id, title, question_type, position)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [quizId, title, question_type, position]
    );
    return result.rows[0];
  }

  // ----------------------------------------------------
  // ADD OPTION TO QUESTION
  // ----------------------------------------------------
  static async addOption(questionId, text, is_correct) {
    const result = await pool.query(
      `INSERT INTO options (question_id, text, is_correct)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [questionId, text, is_correct]
    );
    return result.rows[0];
  }

  // ----------------------------------------------------
  // GET QUESTIONS + OPTIONS (used by ViewQuiz & Live)
  // ----------------------------------------------------
  static async getQuestionsWithOptions(quizId) {
    const questionsRes = await pool.query(
      `SELECT * FROM questions 
       WHERE quiz_id = $1
       ORDER BY position ASC, id ASC`,
      [quizId]
    );

    const questions = questionsRes.rows;

    for (let q of questions) {
      const optsRes = await pool.query(
        `SELECT * FROM options 
         WHERE question_id = $1
         ORDER BY id ASC`,
        [q.id]
      );
      q.options = optsRes.rows;
    }

    return questions;
  }

  // ----------------------------------------------------
  // UPDATE QUESTION TITLE / TYPE
  // ----------------------------------------------------
  static async updateQuestion(questionId, title, question_type) {
    const result = await pool.query(
      `UPDATE questions
       SET title = $1, question_type = $2
       WHERE id = $3
       RETURNING *`,
      [title, question_type, questionId]
    );
    return result.rows[0];
  }

  // ----------------------------------------------------
  // DELETE SINGLE QUESTION
  // ----------------------------------------------------
  static async deleteQuestion(questionId) {
    await pool.query(`DELETE FROM questions WHERE id = $1`, [questionId]);
  }

  // ----------------------------------------------------
  // DELETE ALL QUESTIONS FOR A QUIZ
  // ----------------------------------------------------
  static async deleteAllByQuizId(quizId) {
    await pool.query(
      `DELETE FROM questions WHERE quiz_id = $1`,
      [quizId]
    );
  }

  // ----------------------------------------------------
  // REORDER QUESTIONS (when moving positions)
  // ----------------------------------------------------
  static async updatePosition(questionId, newPosition) {
    await pool.query(
      `UPDATE questions
       SET position = $1
       WHERE id = $2`,
      [newPosition, questionId]
    );
  }

  // ----------------------------------------------------
  // GET OPTIONS FOR QUESTION
  // ----------------------------------------------------
  static async getOptions(questionId) {
    const result = await pool.query(
      `SELECT * FROM options
       WHERE question_id = $1
       ORDER BY id ASC`,
      [questionId]
    );
    return result.rows;
  }

  // ----------------------------------------------------
  // DELETE OPTION
  // ----------------------------------------------------
  static async deleteOption(optionId) {
    await pool.query(`DELETE FROM options WHERE id = $1`, [optionId]);
  }

  // ----------------------------------------------------
  // UPDATE OPTION (text & correctness)
  // ----------------------------------------------------
  static async updateOption(optionId, text, is_correct) {
    const result = await pool.query(
      `UPDATE options
       SET text = $1, is_correct = $2
       WHERE id = $3
       RETURNING *`,
      [text, is_correct, optionId]
    );
    return result.rows[0];
  }
}

module.exports = QuestionRepository;