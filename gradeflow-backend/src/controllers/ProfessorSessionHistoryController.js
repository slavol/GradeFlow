const pool = require("../db/database");

module.exports = {
  getHistory: async (req, res) => {
    try {
      const professorId = req.user.id;

      // 1️⃣ Luăm sesiunile profesorului
      const sessionsRes = await pool.query(
        `SELECT id, quiz_id, session_code, status, created_at
         FROM quiz_sessions
         WHERE professor_id = $1
         ORDER BY created_at DESC`,
        [professorId]
      );

      const sessions = sessionsRes.rows;

      // 2️⃣ Pentru fiecare sesiune, completăm datele
      for (let s of sessions) {

        // Quiz title
        const quizRes = await pool.query(
          `SELECT title FROM quizzes WHERE id = $1`,
          [s.quiz_id]
        );
        s.quiz_title = quizRes.rows[0] ? quizRes.rows[0].title : "Quiz șters";

        // Participants + AVG score (UN SINGUR QUERY)
        const statsRes = await pool.query(
          `SELECT 
              COUNT(*) AS participants,
              AVG(score) AS avg_score
           FROM student_sessions
           WHERE session_id = $1`,
          [s.id]
        );

        s.participants = Number(statsRes.rows[0].participants);
        s.avg_score = statsRes.rows[0].avg_score
          ? Math.round(statsRes.rows[0].avg_score)
          : 0;
      }

      return res.json(sessions);

    } catch (err) {
      console.error("HISTORY ERROR:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
  },

  deleteSession: async (req, res) => {
    try {
      const professorId = req.user.id;
      const sessionId = req.params.id;

      const check = await pool.query(
        `SELECT id FROM quiz_sessions WHERE id=$1 AND professor_id=$2`,
        [sessionId, professorId]
      );

      if (check.rows.length === 0) {
        return res.status(404).json({ message: "Sesiunea nu a fost găsită." });
      }

      await pool.query(`DELETE FROM quiz_sessions WHERE id=$1`, [sessionId]);

      res.json({ success: true });
    } catch (err) {
      console.error("DELETE SESSION ERROR:", err);
      res.status(500).json({ message: "Server error." });
    }
  }
};