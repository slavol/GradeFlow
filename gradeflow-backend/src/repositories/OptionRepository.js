const prisma = require("../../prisma/client");

class OptionRepository {
  // ----------------------------------------------------
  // CREATE OPTION
  // ----------------------------------------------------
  static async createOption(questionId, text, is_correct = false) {
    return prisma.option.create({
      data: {
        questionId,
        text,
        isCorrect: is_correct,
      },
    });
  }

  // ----------------------------------------------------
  // GET OPTIONS FOR A QUESTION
  // ----------------------------------------------------
  static async getOptionsByQuestionId(questionId) {
    return prisma.option.findMany({
      where: {
        questionId,
      },
      orderBy: {
        id: "asc",
      },
    });
  }

  // ----------------------------------------------------
  // UPDATE OPTION
  // ----------------------------------------------------
  static async updateOption(optionId, text, is_correct) {
    return prisma.option.update({
      where: {
        id: optionId,
      },
      data: {
        text,
        isCorrect: is_correct,
      },
    });
  }

  // ----------------------------------------------------
  // DELETE OPTION
  // ----------------------------------------------------
  static async deleteOption(optionId) {
    return prisma.option.delete({
      where: {
        id: optionId,
      },
    });
  }

  // ----------------------------------------------------
  // DELETE ALL OPTIONS OF A QUESTION
  // ----------------------------------------------------
  static async deleteByQuestionId(questionId) {
    return prisma.option.deleteMany({
      where: {
        questionId,
      },
    });
  }
}

module.exports = OptionRepository;