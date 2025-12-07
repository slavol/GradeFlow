const pool = require("../db/database");

module.exports = {
  getHistory: async (req, res) => {
    try {
      const professorId = req.user.id;

      // 1️⃣ Luăm toate sesiunile profesorului, fără join
      const sessionsResult = await pool.query(
        "SELECT * FROM quiz_sessions WHERE professor_id = $1 ORDER BY created_at DESC",
        [professorId]
      );

      const sessions = sessionsResult.rows;

      // 2️⃣ Pentru fiecare sesiune luăm quiz-ul aferent
      for (let s of sessions) {
        const quizRes = await pool.query(
          "SELECT id, title FROM quizzes WHERE id = $1",
          [s.quiz_id]
        );

        s.quiz = quizRes.rows[0] || { id: null, title: "Quiz șters" };

        // 3️⃣ Calcule rapide
        const studCount = await pool.query(
          "SELECT COUNT(*) FROM student_sessions WHERE session_id = $1",
          [s.id]
        );

        s.participants = Number(studCount.rows[0].count);

        const avgScore = await pool.query(
          "SELECT AVG(score) FROM student_sessions WHERE session_id = $1 AND completed = true",
          [s.id]
        );

        s.avg_score = avgScore.rows[0].avg ? Math.round(avgScore.rows[0].avg) : 0;
      }

      return res.json({ sessions });

    } catch (err) {
      console.error("HISTORY ERROR:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
  },

  deleteSession: async (req, res) => {
  try {
    const professorId = req.user.id;
    const sessionId = req.params.id;

    // Securitate: șterge doar dacă sesiunea aparține profesorului
    const check = await pool.query(
      `SELECT id FROM quiz_sessions WHERE id=$1 AND professor_id=$2`,
      [sessionId, professorId]
    );

    if (check.rows.length === 0) {
      return res.status(404).json({ message: "Sesiunea nu a fost găsită." });
    }

    // DELETE CASCADE se ocupă de restul în DB
    await pool.query(`DELETE FROM quiz_sessions WHERE id=$1`, [sessionId]);

    res.json({ success: true });
  } catch (err) {
    console.error("DELETE SESSION ERROR:", err);
    res.status(500).json({ message: "Server error." });
  }
},

};