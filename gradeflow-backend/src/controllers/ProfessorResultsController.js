const pool = require("../db/database");

module.exports = {
  getResults: async (req, res) => {
    try {
      const sessionId = req.params.id;

      // 1️⃣ Informații despre sesiune
      const sessionRes = await pool.query(
        `SELECT * FROM quiz_sessions WHERE id = $1`,
        [sessionId]
      );
      const session = sessionRes.rows[0];

      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }

      // 2️⃣ Studenții participanți
      const studentsRes = await pool.query(
        `SELECT ss.*, u.email 
         FROM student_sessions ss
         JOIN users u ON u.id = ss.student_id
         WHERE ss.session_id = $1`,
        [sessionId]
      );
      const students = studentsRes.rows;

      // 3️⃣ Răspunsuri individuale
      const answersRes = await pool.query(
        `SELECT sa.*, q.title AS question_title, o.text AS option_text 
         FROM student_answers sa
         JOIN questions q ON q.id = sa.question_id
         JOIN options o ON o.id = sa.option_id
         WHERE sa.student_session_id IN (
            SELECT id FROM student_sessions WHERE session_id = $1
         )`,
        [sessionId]
      );

      const answers = answersRes.rows;

      // 4️⃣ Analytics pentru întrebări
      const analyticsRes = await pool.query(
        `SELECT 
          q.id AS question_id,
          q.title,
          COUNT(sa.id) AS total_answers,
          SUM(CASE WHEN sa.is_correct THEN 1 ELSE 0 END) AS correct_answers
         FROM questions q
         LEFT JOIN student_answers sa ON sa.question_id = q.id
         WHERE q.quiz_id = $1
         GROUP BY q.id
         ORDER BY q.id`,
        [session.quiz_id]
      );

      const analytics = analyticsRes.rows;

      res.json({
        session,
        students,
        answers,
        analytics,
      });

    } catch (err) {
      console.error("RESULTS ERROR:", err);
      res.status(500).json({ message: "Server error" });
    }
  }
};