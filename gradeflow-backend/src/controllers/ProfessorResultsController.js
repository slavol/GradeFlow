const pool = require("../db/database");

module.exports = {
  getResults: async (req, res) => {
    try {
      const sessionId = req.params.id;

      // 1️⃣ Sesiunea
      const sessionRes = await pool.query(
        `SELECT * FROM quiz_sessions WHERE id = $1`,
        [sessionId]
      );

      const session = sessionRes.rows[0];
      if (!session) {
        return res.status(404).json({ message: "Sesiunea nu există." });
      }

      // 2️⃣ Studenții din sesiune
      const studentsRes = await pool.query(
        `SELECT ss.id AS student_session_id, ss.*, u.email 
         FROM student_sessions ss
         JOIN users u ON u.id = ss.student_id
         WHERE ss.session_id = $1
         ORDER BY ss.score DESC`,
        [sessionId]
      );

      const students = studentsRes.rows;

      // 3️⃣ Răspunsuri complete (cu lista de opțiuni selectate)
      const answersRes = await pool.query(
        `SELECT 
          sa.*, 
          q.title AS question_title,
          q.position,
          o.id AS option_id,
          o.text AS option_text
         FROM student_answers sa
         JOIN questions q ON q.id = sa.question_id
         JOIN LATERAL (
            SELECT id, text 
            FROM options 
            WHERE question_id = sa.question_id
         ) o ON TRUE
         WHERE sa.student_session_id IN (
            SELECT id FROM student_sessions WHERE session_id = $1
         )
         ORDER BY sa.student_session_id, q.position ASC`,
        [sessionId]
      );

      const answersRaw = answersRes.rows;

      // 4️⃣ Organizăm răspunsurile pe student → întrebare → opțiuni selectate
      const answers = {};

      for (const ans of answersRaw) {
        if (!answers[ans.student_session_id]) answers[ans.student_session_id] = {};

        if (!answers[ans.student_session_id][ans.question_id]) {
          answers[ans.student_session_id][ans.question_id] = {
            question_id: ans.question_id,
            question_title: ans.question_title,
            position: ans.position,
            selected_option_ids: ans.selected_option_ids,
            is_correct: ans.is_correct,
            options: []
          };
        }

        answers[ans.student_session_id][ans.question_id].options.push({
          option_id: ans.option_id,
          option_text: ans.option_text
        });
      }

      // 5️⃣ Analytics pe întrebări
      const analyticsRes = await pool.query(
        `SELECT 
          q.id AS question_id,
          q.title,
          q.position,
          COUNT(sa.id) AS total_answers,
          SUM(CASE WHEN sa.is_correct THEN 1 ELSE 0 END) AS correct_answers
         FROM questions q
         LEFT JOIN student_answers sa ON sa.question_id = q.id
         WHERE q.quiz_id = $1
         GROUP BY q.id
         ORDER BY q.position ASC`,
        [session.quiz_id]
      );

      const analytics = analyticsRes.rows;

      res.json({
        session,
        students,
        answers,
        analytics
      });

    } catch (err) {
      console.error("RESULTS ERROR:", err);
      res.status(500).json({ message: "Server error" });
    }
  }
};