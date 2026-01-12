const prisma = require("../../prisma/client");

class ProfessorRepository {

  static async getDashboardStats(professorId) {
    const totalQuizzes = await prisma.quizzes.count({
      where: {
        professor_id: professorId,
      },
    });

    const totalQuestions = await prisma.questions.count({
      where: {
        quizzes: {
          professor_id: professorId,
        },
      },
    });

    const students = await prisma.student_sessions.findMany({
      where: {
        quiz_sessions: {
          professor_id: professorId,
        },
      },
      distinct: ["student_id"],
      select: {
        student_id: true,
      },
    });

    const totalStudents = students.length;

    return {
      total_quizzes: totalQuizzes,
      total_questions: totalQuestions,
      total_students: totalStudents,
    };
  }
}

module.exports = ProfessorRepository;