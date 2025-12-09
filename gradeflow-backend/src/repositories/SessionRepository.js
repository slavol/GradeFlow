const pool = require("../db/database");

// Helper pentru cod unic
function generateSessionCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

class SessionRepository {
  static async createSession(quizId, professorId) {
    const sessionCode = generateSessionCode();

    const res = await pool.query(
      `INSERT INTO quiz_sessions (quiz_id, professor_id, session_code, status)
       VALUES ($1, $2, $3, 'active')
       RETURNING *`,
      [quizId, professorId, sessionCode]
    );

    return res.rows[0];
  }

  static async getSessionById(sessionId) {
    const res = await pool.query(
      `SELECT * FROM quiz_sessions WHERE id = $1`,
      [sessionId]
    );
    return res.rows[0];
  }

  static async closeSession(sessionId, professorId) {
    await pool.query(
      `UPDATE quiz_sessions
       SET status = 'closed'
       WHERE id = $1 AND professor_id = $2`,
      [sessionId, professorId]
    );
  }

  static async getSessionWithQuiz(sessionId) {
    const res = await pool.query(
      `SELECT qs.*, q.title, q.description
       FROM quiz_sessions qs
       JOIN quizzes q ON q.id = qs.quiz_id
       WHERE qs.id = $1`,
      [sessionId]
    );
    return res.rows[0];
  }
}

module.exports = SessionRepository;