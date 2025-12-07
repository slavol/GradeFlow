const pool = require("../db/database");

module.exports = {
  startSession: async (req, res) => {
    try {
      const quizId = req.params.id;
      const professorId = req.user.id;

      const sessionCode = Math.random().toString(36).substring(2, 8).toUpperCase();

      const result = await pool.query(
        `INSERT INTO quiz_sessions (quiz_id, professor_id, session_code)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [quizId, professorId, sessionCode]
      );

      res.json({ message: "Session started", session: result.rows[0] });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  },

  getSession: async (req, res) => {
    try {
      const sessionId = req.params.id;

      const sessionRes = await pool.query(
        `SELECT * FROM quiz_sessions WHERE id=$1`,
        [sessionId]
      );

      if (!sessionRes.rows.length)
        return res.status(404).json({ message: "Session not found" });

      const studentsRes = await pool.query(
        `SELECT u.id, u.email
         FROM session_participants sp
         JOIN users u ON sp.student_id = u.id
         WHERE sp.session_id=$1`,
        [sessionId]
      );

      res.json({
        session: sessionRes.rows[0],
        students: studentsRes.rows,
      });

    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  },


  closeSession: async (req, res) => {
    try {
      const sessionId = req.params.id;

      await pool.query(
        `UPDATE quiz_sessions SET status='closed' WHERE id=$1`,
        [sessionId]
      );

      res.json({ message: "Session closed" });

    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  },

  getHistory: async (req, res) => {
    try {
      const professorId = req.user.id;

      // 1. luăm toate sesiunile pentru profesor
      const sessionsRes = await pool.query(
        `SELECT id, quiz_id, session_code, status, created_at
         FROM quiz_sessions
         WHERE professor_id = $1
         ORDER BY created_at DESC`,
        [professorId]
      );

      const sessions = sessionsRes.rows;

      // 2. pentru fiecare sesiune, luăm titlul quiz-ului (fără JOIN)
      for (const s of sessions) {
        const quizRes = await pool.query(
          `SELECT title FROM quizzes WHERE id = $1`,
          [s.quiz_id]
        );
        s.quiz_title = quizRes.rows[0] ? quizRes.rows[0].title : null;
      }

      // trimitem direct array (frontend-ul e pregătit și pt { sessions: [...] })
      res.json(sessions);
    } catch (err) {
      console.error("HISTORY ERROR:", err);
      res.status(500).json({ message: "Server error" });
    }
  }
};