const pool = require("../db/database");

class SessionRepository {
  static async createSession(quizId, professorId) {
    const sessionCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    const res = await pool.query(
      `INSERT INTO quiz_sessions (quiz_id, professor_id, session_code, is_active)
       VALUES ($1, $2, $3, true)
       RETURNING *`,
      [quizId, professorId, sessionCode]
    );

    return res.rows[0];
  }

  static async getSessionById(sessionId, professorId) {
    const res = await pool.query(
      `SELECT * FROM quiz_sessions 
       WHERE id = $1 AND professor_id = $2`,
      [sessionId, professorId]
    );
    return res.rows[0];
  }

  static async closeSession(sessionId, professorId) {
    await pool.query(
      `UPDATE quiz_sessions
       SET is_active = false
       WHERE id = $1 AND professor_id = $2`,
      [sessionId, professorId]
    );
  }
}

module.exports = SessionRepository;