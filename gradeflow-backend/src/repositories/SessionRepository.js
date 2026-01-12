const prisma = require("../../prisma/client");

// helper pt cod sesiune
function generateSessionCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

class SessionRepository {
  static async createSession(quizId, professorId, mode = "LIVE") {
  const sessionCode = generateSessionCode(); 

  return prisma.quiz_sessions.create({
    data: {
      quiz_id: Number(quizId),
      professor_id: Number(professorId),
      session_code: sessionCode,
      status: "active",
      mode, 
    },
  });
}

  static async getSessionById(sessionId) {
    return prisma.quiz_sessions.findUnique({
      where: { id: Number(sessionId) },
    });
  }

  static async closeSession(sessionId, professorId) {
    return prisma.quiz_sessions.updateMany({
      where: {
        id: Number(sessionId),
        professor_id: Number(professorId),
      },
      data: {
        status: "closed",
      },
    });
  }

  static async getSessionWithQuiz(sessionId) {
    if (!sessionId) {
      throw new Error("Session ID missing");
    }


    return prisma.quiz_sessions.findUnique({
      where: { id: Number(sessionId) },
      include: {
        quizzes: true,
      },
    });
  }

  static async getLiveSessions(professorId) {
    return prisma.quiz_sessions.findMany({
      where: {
        professor_id: Number(professorId),
        status: "active",
      },
      orderBy: {
        created_at: "desc",
      },
    });
  }
}

module.exports = SessionRepository;