const pool = require("../db/database");

class OptionRepository {
  // ----------------------------------------------------
  // CREATE OPTION
  // ----------------------------------------------------
  static async createOption(questionId, text, is_correct = false) {
    const result = await pool.query(
      `INSERT INTO options (question_id, text, is_correct)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [questionId, text, is_correct]
    );

    return result.rows[0];
  }

  // ----------------------------------------------------
  // GET OPTIONS FOR A QUESTION
  // ----------------------------------------------------
  static async getOptionsByQuestionId(questionId) {
    const result = await pool.query(
      `SELECT * FROM options
       WHERE question_id = $1
       ORDER BY id ASC`,
      [questionId]
    );

    return result.rows;
  }

  // ----------------------------------------------------
  // UPDATE OPTION
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

  // ----------------------------------------------------
  // DELETE OPTION
  // ----------------------------------------------------
  static async deleteOption(optionId) {
    await pool.query(
      `DELETE FROM options WHERE id = $1`,
      [optionId]
    );
  }

  // ----------------------------------------------------
  // DELETE ALL OPTIONS OF A QUESTION
  // ----------------------------------------------------
  static async deleteByQuestionId(questionId) {
    await pool.query(
      `DELETE FROM options WHERE question_id = $1`,
      [questionId]
    );
  }
}

module.exports = OptionRepository;