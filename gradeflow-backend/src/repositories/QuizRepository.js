const prisma = require("../../prisma/client");

class QuizRepository {
  static async create(professorId, title, description, timeLimit, creationType) {
    const joinCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    console.log("📦 PRISMA CREATE QUIZ:", {
      professorId,
      title,
      description,
      timeLimit,
      creationType
    });

    return prisma.quizzes.create({
      data: {
        professor_id: Number(professorId),
        title,
        description,
        time_limit: timeLimit, // 👈 FORȚAT NUMBER
        creation_type: creationType,
        join_code: joinCode
      }
    });
  }

  static async getByProfessorId(professorId) {
    return prisma.quizzes.findMany({
      where: { professor_id: Number(professorId) },
      orderBy: { created_at: "desc" }
    });
  }

  static async delete(id, professorId) {
    return prisma.quizzes.deleteMany({
      where: {
        id: Number(id),
        professor_id: Number(professorId)
      }
    });
  }

  static async findById(id, professorId) {
    return prisma.quizzes.findFirst({
      where: {
        id: Number(id),
        professor_id: Number(professorId)
      }
    });
  }

  static async updateQuizMeta(id, professorId, title, description, time_limit) {
    return prisma.quizzes.updateMany({
      where: {
        id: Number(id),
        professor_id: Number(professorId)
      },
      data: {
        title,
        description,
        time_limit: time_limit
      }
    });
  }

  static async findSessionById(sessionId) {
    return prisma.quiz_sessions.findUnique({
      where: { id: Number(sessionId) }
    });
  }
}

module.exports = QuizRepository;