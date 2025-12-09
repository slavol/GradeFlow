const db = require("../db/database");
const SessionRepository = require("../repositories/SessionRepository");

module.exports = {

  // =====================================================
  // START SESSION
  // =====================================================
  startSession: async (req, res) => {
    try {
      const quizId = req.params.id;
      const professorId = req.user.id;

      const session = await SessionRepository.createSession(quizId, professorId);

      return res.json({
        success: true,
        message: "Session started",
        session
      });

    } catch (err) {
      console.error("START SESSION ERROR:", err);
      return res.status(500).json({ error: "Server error" });
    }
  },

  // =====================================================
  // GET LIVE SESSION INFO (for professor panel)
  // =====================================================
  getSession: async (req, res) => {
    try {
      const sessionId = req.params.id;

      // session + quiz info
      const session = await SessionRepository.getSessionWithQuiz(sessionId);
      if (!session) return res.status(404).json({ error: "Session not found" });

      // list all students & their score (live scoreboard)
      const studentsRes = await db.query(
        `SELECT 
            ss.id AS student_session_id,
            u.id AS student_id,
            u.email,
            ss.score,
            ss.completed
         FROM student_sessions ss
         JOIN users u ON u.id = ss.student_id
         WHERE ss.session_id = $1
         ORDER BY ss.completed ASC, ss.score DESC`,
        [sessionId]
      );

      return res.json({
        session,
        students: studentsRes.rows,
      });

    } catch (err) {
      console.error("GET SESSION ERROR:", err);
      return res.status(500).json({ error: "Server error" });
    }
  },

  // =====================================================
  // CLOSE SESSION
  // =====================================================
  closeSession: async (req, res) => {
    try {
      const sessionId = req.params.id;
      const professorId = req.user.id;

      await SessionRepository.closeSession(sessionId, professorId);

      return res.json({ success: true, message: "Session closed" });

    } catch (err) {
      console.error("CLOSE SESSION ERROR:", err);
      return res.status(500).json({ error: "Server error" });
    }
  },
};