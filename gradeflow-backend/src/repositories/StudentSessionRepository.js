const prisma = require("../../prisma/client");

class StudentSessionRepository {

  static async joinSession(sessionCode, studentId) {
    const session = await prisma.quiz_sessions.findFirst({
      where: {
        session_code: sessionCode,
        status: "active",
      },
    });

    if (!session) return null;

    const existing = await prisma.student_sessions.findFirst({
      where: {
        session_id: session.id,
        student_id: Number(studentId),
      },
    });

    if (existing) {
      return { session, studentSession: existing };
    }

    const studentSession = await prisma.student_sessions.create({
      data: {
        session_id: session.id,
        student_id: Number(studentId),
      },
    });

    return { session, studentSession };
  }

  static async getStudentSession(sessionId, studentId) {
    const session = await prisma.quiz_sessions.findUnique({
      where: { id: Number(sessionId) },
    });

    if (!session) return null;

    const studentSession = await prisma.student_sessions.findFirst({
      where: {
        session_id: session.id,
        student_id: Number(studentId),
      },
    });

    return { session, studentSession };
  }

  static async getQuizTimeLimit(sessionId) {
    const res = await prisma.quiz_sessions.findUnique({
      where: { id: Number(sessionId) },
      include: {
        quizzes: true,
      },
    });

    return res?.quizzes?.time_limit ?? 0;
  }

  static async getQuizQuestions(sessionId) {
    const session = await prisma.quiz_sessions.findUnique({
      where: { id: Number(sessionId) },
      select: { quiz_id: true },
    });

    if (!session) return [];

    return prisma.questions.findMany({
      where: { quiz_id: session.quiz_id },
      orderBy: { position: "asc" },
    });
  }

  static async getQuestionOptions(questionId) {
    return prisma.options.findMany({
      where: { question_id: Number(questionId) },
      orderBy: { id: "asc" },
    });
  }

  static async hasAnswered(studentSessionId, questionId) {
    const res = await prisma.student_answers.findFirst({
      where: {
        student_session_id: Number(studentSessionId),
        question_id: Number(questionId),
      },
    });

    return !!res;
  }

  static async saveAnswer(studentSessionId, questionId, selectedIds, isCorrect) {
    await prisma.student_answers.create({
      data: {
        student_session_id: Number(studentSessionId),
        question_id: Number(questionId),
        selected_option_ids: selectedIds,
        is_correct: isCorrect,
      },
    });
  }

  static async incrementScoreBy(studentSessionId, amount) {
  return prisma.student_sessions.update({
    where: { id: Number(studentSessionId) },
    data: {
      score: { increment: Number(amount) || 0 },
    },
  });
}


  static async incrementScore(studentSessionId) {
    await prisma.student_sessions.update({
      where: { id: Number(studentSessionId) },
      data: {
        score: { increment: 1 },
      },
    });
  }

  static async advanceQuestion(studentSessionId) {
    await prisma.student_sessions.update({
      where: { id: Number(studentSessionId) },
      data: {
        current_index: { increment: 1 },
      },
    });
  }

  static async markCompleted(studentSessionId) {
    await prisma.student_sessions.update({
      where: { id: Number(studentSessionId) },
      data: {
        completed: true,
        finished_at: new Date(),
      },
    });
  }

  static async getCorrectOptionIds(questionId) {
    const res = await prisma.options.findMany({
      where: {
        question_id: Number(questionId),
        is_correct: true,
      },
      select: { id: true },
    });

    return res.map(r => r.id);
  }

  static async getSelectedOptionIds(studentSessionId, questionId) {
    const res = await prisma.student_answers.findFirst({
      where: {
        student_session_id: Number(studentSessionId),
        question_id: Number(questionId),
      },
      select: {
        selected_option_ids: true,
      },
    });

    return res?.selected_option_ids ?? [];
  }

  static async getStudentAnswers(studentSessionId) {
    return prisma.student_answers.findMany({
      where: { student_session_id: Number(studentSessionId) },
    });
  }

  static async getLeaderboard(sessionId) {
    const rows = await prisma.student_sessions.findMany({
      where: {
        session_id: Number(sessionId),
        completed: true,
      },
      include: {
        users: {
          select: { email: true },
        },
      },
      orderBy: [
        { score: "desc" },
        { finished_at: "asc" },
      ],
    });

    return rows.map(r => ({
      student_session_id: r.id,
      email: r.users?.email ?? null,
      score: r.score,
      finished_at: r.finished_at,
    }));
  }

  static async getOptionTexts(optionIds) {
    if (!optionIds || optionIds.length === 0) return [];

    return prisma.options.findMany({
      where: {
        id: { in: optionIds },
      },
      select: {
        id: true,
        text: true,
      },
    });
  }

  static async getStudentHistory(studentId) {
    return prisma.student_sessions.findMany({
      where: { student_id: Number(studentId) },
      include: {
        quiz_sessions: {
          include: {
            quizzes: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
      orderBy: {
        finished_at: "desc",
      },
    });
  }

  async advanceAllStudents(sessionId) {
    return prisma.student_sessions.updateMany({
      where: {
        session_id: Number(sessionId),
        completed: false,
      },
      data: {
        current_index: {
          increment: 1,
        },
      },
    });
  }

  static async finishSessionWithScore(studentSessionId, score) {
  return prisma.student_sessions.update({
    where: { id: Number(studentSessionId) },
    data: {
      score,
      completed: true,
      finished_at: new Date(),
    },
  });
}

static async getAnswerRow(studentSessionId, questionId) {
  return prisma.student_answers.findFirst({
    where: {
      student_session_id: Number(studentSessionId),
      question_id: Number(questionId),
    },
    select: {
      id: true,
      selected_option_ids: true,
      is_correct: true,
      explanation_text: true,
      explanation_created_at: true,
    },
  });
}


static async saveExplanation(studentSessionId, questionId, explanation) {
  const r = await prisma.student_answers.updateMany({
    where: {
      student_session_id: Number(studentSessionId),
      question_id: Number(questionId),
    },
    data: {
      explanation_text: explanation,
      explanation_created_at: new Date(),
    },
  });

  return r.count; 
}

}


module.exports = StudentSessionRepository;