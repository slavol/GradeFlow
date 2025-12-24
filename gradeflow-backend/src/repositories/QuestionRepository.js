const prisma = require("../../prisma/client");

class QuestionRepository {

  static async createQuestion(quizId, title, question_type, position = 0) {
    return prisma.questions.create({
      data: {
        quiz_id: Number(quizId),
        title,
        question_type,
        position
      }
    });
  }

  static async addOption(questionId, text, is_correct = false) {
    return prisma.options.create({
      data: {
        question_id: Number(questionId),
        text,
        is_correct
      }
    });
  }

  static async getQuestionsWithOptions(quizId) {
    return prisma.questions.findMany({
      where: {
        quiz_id: Number(quizId)
      },
      orderBy: [
        { position: "asc" },
        { id: "asc" }
      ],
      include: {
        options: true
      }
    });
  }

  static async updateQuestion(questionId, title, question_type) {
    return prisma.questions.update({
      where: { id: Number(questionId) },
      data: { title, question_type }
    });
  }

  static async deleteQuestion(questionId) {
    return prisma.questions.delete({
      where: { id: Number(questionId) }
    });
  }

  static async updatePosition(questionId, newPosition) {
    return prisma.questions.update({
      where: { id: Number(questionId) },
      data: { position: newPosition }
    });
  }
}

module.exports = QuestionRepository;