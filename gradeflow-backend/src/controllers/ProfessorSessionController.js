const db = require("../db/database");
const SessionRepository = require("../repositories/SessionRepository");
const StudentSessionRepo = require("../repositories/StudentSessionRepository"); // 👈 NECESAR
const QuizRepository = require("../repositories/QuizRepository"); // 👈 NECESAR

const { Parser } = require("json2csv");

module.exports = {

  // =====================================================
  // START SESSION
  // =====================================================
  startSession: async (req, res) => {
  try {
    const quizId = req.params.id;
    const professorId = req.user.id;

    // ✅ SAFE DEFAULT
    const { mode = "LIVE" } = req.body || {};

    const session = await SessionRepository.createSession(
      quizId,
      professorId,
      mode
    );

    return res.json({
      success: true,
      message: "Session started",
      session,
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

      const session = await SessionRepository.getSessionWithQuiz(sessionId);
      if (!session) return res.status(404).json({ error: "Session not found" });

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

  // =====================================================
  // EXPORT CSV
  // =====================================================
  async exportCSV(req, res) {
    try {
      const sessionId = req.params.id;
      const professorId = req.user.id;

      // verificăm dacă sesiunea aparține profesorului
      const session = await QuizRepository.findSessionById(sessionId);

      if (!session || session.professor_id !== professorId) {
        return res.status(403).json({ error: "Nu ai acces la această sesiune." });
      }

      // leaderboard cu scorurile
      const leaderboard = await StudentSessionRepo.getLeaderboard(sessionId);

      if (!leaderboard || leaderboard.length === 0) {
        return res.status(404).json({ error: "Nu există rezultate pentru export." });
      }

      // pregătim datele pentru CSV
      const data = leaderboard.map((row) => ({
        email: row.email,
        score: row.score,
        completed: row.completed ? "DA" : "NU",
        finished_at: row.finished_at || "—",
      }));

      const fields = ["email", "score", "completed", "finished_at"];
      const parser = new Parser({ fields });
      const csv = parser.parse(data);

      // setăm header-ele pentru download
      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="session_${sessionId}_results.csv"`
      );

      return res.send(csv);

    } catch (err) {
      console.error("EXPORT CSV ERROR:", err);
      return res.status(500).json({ error: "Eroare server." });
    }
  },

  getLiveSessions: async (req, res) => {
    try {
      const professorId = req.user.id;

      const sessions = await SessionRepository.getLiveSessions(professorId);

      res.json(sessions);
    } catch (err) {
      console.error("GET LIVE SESSIONS ERROR:", err);
      res.status(500).json({ error: "Server error" });
    }
  },

  // =====================================================
// NEXT QUESTION (LIVE MODE)
// =====================================================
async nextQuestion(req, res) {
  try {
    const sessionId = req.params.id;
    const professorId = req.user.id;

    const session = await SessionRepository.findById(sessionId);

    if (!session || session.professor_id !== professorId) {
      return res.status(403).json({ error: "Acces interzis." });
    }

    if (session.mode !== "LIVE") {
      return res.status(400).json({ error: "Next question permis doar în LIVE." });
    }

    await StudentSessionRepo.advanceAllStudents(sessionId);

    return res.json({
      success: true,
      message: "Următoarea întrebare trimisă",
    });

  } catch (err) {
    console.error("NEXT QUESTION ERROR:", err);
    return res.status(500).json({ error: "Server error." });
  }
},

};