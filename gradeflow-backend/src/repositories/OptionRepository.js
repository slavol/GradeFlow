const prisma = require("../../prisma/client");

class OptionRepository {
  static async createOption(questionId, text, is_correct = false) {
    return prisma.option.create({
      data: {
        questionId,
        text,
        isCorrect: is_correct,
      },
    });
  }

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

  static async deleteOption(optionId) {
    return prisma.option.delete({
      where: {
        id: optionId,
      },
    });
  }


  static async deleteByQuestionId(questionId) {
    return prisma.option.deleteMany({
      where: {
        questionId,
      },
    });
  }
}

module.exports = OptionRepository;