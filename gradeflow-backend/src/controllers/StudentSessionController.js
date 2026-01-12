const StudentSessionRepo = require("../repositories/StudentSessionRepository");

function computeTimeLeft(session, studentSession) {
  if (!session?.quizzes?.time_limit || session.quizzes.time_limit <= 0) {
    return null;
  }

  const startedAt = studentSession.started_at;
  if (!startedAt) return null;

  const totalSeconds = session.quizzes.time_limit * 60;
  const elapsedSeconds = Math.floor(
    (Date.now() - new Date(startedAt).getTime()) / 1000
  );

  return Math.max(totalSeconds - elapsedSeconds, 0);
}

module.exports = {
  async joinSession(req, res) {
    try {
      const { session_code } = req.body;
      const studentId = req.user.id;

      if (!session_code) {
        return res.status(400).json({ error: "Codul sesiunii este necesar." });
      }

      const result = await StudentSessionRepo.joinSession(session_code, studentId);
      if (!result) {
        return res.status(404).json({ error: "Sesiune invalidă sau închisă." });
      }

      return res.json({
        success: true,
        session_id: result.session.id,
        student_session_id: result.studentSession.id,
      });
    } catch (err) {
      console.error("JOIN SESSION ERROR:", err);
      res.status(500).json({ error: "Server error." });
    }
  },

  async getSessionData(req, res) {
  try {
    const sessionId = req.params.id;
    const studentId = req.user.id;

    const data = await StudentSessionRepo.getStudentSession(sessionId, studentId);
    if (!data || !data.session || !data.studentSession) {
      return res.status(404).json({ error: "Sesiunea nu există." });
    }

    const { session, studentSession } = data;

    let time_left = null;

    const timeLimitMinutes = await StudentSessionRepo.getQuizTimeLimit(sessionId);

    if (timeLimitMinutes > 0 && studentSession.started_at) {
      const endTime =
        new Date(studentSession.started_at).getTime() +
        timeLimitMinutes * 60 * 1000;

      time_left = Math.max(
        0,
        Math.floor((endTime - Date.now()) / 1000)
      );
    }

    if (time_left === 0 && !studentSession.completed) {
      await StudentSessionRepo.markCompleted(studentSession.id);
      return res.json({ finished: true });
    }

    if (studentSession.completed) {
      return res.json({
        finished: true,
        score: studentSession.score,
      });
    }

    const questions = await StudentSessionRepo.getQuizQuestions(sessionId);
    if (!questions.length) {
      return res.json({ error: "Quiz fără întrebări." });
    }

    if (session.mode === "LIVE") {
      const index = studentSession.current_index;

      if (index >= questions.length) {
        await StudentSessionRepo.markCompleted(studentSession.id);
        return res.json({ finished: true });
      }

      const q = questions[index];
      const options = await StudentSessionRepo.getQuestionOptions(q.id);

      return res.json({
        mode: "LIVE",
        session,
        question: {
          id: q.id,
          text: q.title,
          question_type: q.question_type,
          options,
        },
        index,
        total: questions.length,
        time_left,
      });
    }

    if (session.mode === "ALL") {
      const formatted = await Promise.all(
        questions.map(async (q) => {
          const options = await StudentSessionRepo.getQuestionOptions(q.id);
          return {
            id: q.id,
            text: q.title,
            question_type: q.question_type,
            options,
          };
        })
      );

      return res.json({
        mode: "ALL",
        session,
        questions: formatted,
        total: questions.length,
        time_left,
      });
    }

  } catch (err) {
    console.error("GET SESSION DATA ERROR:", err);
    res.status(500).json({ error: "Server error." });
  }
},

  async submitAnswer(req, res) {
    try {
      const sessionId = req.params.id;
      const studentId = req.user.id;
      const { question_id, selected_option_ids } = req.body;

      if (!Array.isArray(selected_option_ids) || !selected_option_ids.length) {
        return res.status(400).json({ error: "Selectează cel puțin o opțiune." });
      }

      const data = await StudentSessionRepo.getStudentSession(sessionId, studentId);
      if (!data) {
        return res.status(403).json({ error: "Acces interzis." });
      }

      const correctIds = await StudentSessionRepo.getCorrectOptionIds(question_id);

      const isCorrect =
        JSON.stringify([...correctIds].sort()) ===
        JSON.stringify([...selected_option_ids].sort());

      await StudentSessionRepo.saveAnswer(
        data.studentSession.id,
        question_id,
        selected_option_ids,
        isCorrect
      );

      if (isCorrect) {
        await StudentSessionRepo.incrementScore(data.studentSession.id);
      }

      await StudentSessionRepo.advanceQuestion(data.studentSession.id);

      res.json({ success: true });
    } catch (err) {
      console.error("SUBMIT ANSWER ERROR:", err);
      res.status(500).json({ error: "Server error." });
    }
  },

  async submitAllAnswers(req, res) {
    try {
      const sessionId = req.params.id;
      const studentId = req.user.id;
      const { answers } = req.body;

      if (!Array.isArray(answers) || !answers.length) {
        return res.status(400).json({ error: "Nu există răspunsuri." });
      }

      const data = await StudentSessionRepo.getStudentSession(sessionId, studentId);
      if (!data) {
        return res.status(403).json({ error: "Acces interzis." });
      }

      for (const ans of answers) {
        const correctIds = await StudentSessionRepo.getCorrectOptionIds(ans.question_id);
        const isCorrect =
          JSON.stringify([...correctIds].sort()) ===
          JSON.stringify([...ans.selected_option_ids].sort());

        await StudentSessionRepo.saveAnswer(
          data.studentSession.id,
          ans.question_id,
          ans.selected_option_ids,
          isCorrect
        );

        if (isCorrect) {
          await StudentSessionRepo.incrementScore(data.studentSession.id);
        }
      }

      await StudentSessionRepo.markCompleted(data.studentSession.id);

      res.json({ success: true, finished: true });
    } catch (err) {
      console.error("SUBMIT ALL ERROR:", err);
      res.status(500).json({ error: "Server error." });
    }
  },

  async getResults(req, res) {
    try {
      const sessionId = req.params.id;
      const studentId = req.user.id;

      const data = await StudentSessionRepo.getStudentSession(sessionId, studentId);
      if (!data || !data.studentSession.completed) {
        return res.status(403).json({ error: "Quiz neterminat." });
      }

      const questions = await StudentSessionRepo.getQuizQuestions(sessionId);
      const studentAnswers = await StudentSessionRepo.getStudentAnswers(
        data.studentSession.id
      );

      const detailed = await Promise.all(
        questions.map(async (q) => {
          const opts = await StudentSessionRepo.getQuestionOptions(q.id);
          const correct = opts.filter((o) => o.is_correct);
          const ans = studentAnswers.find((a) => a.question_id === q.id);

          return {
            question_id: q.id,
            question_text: q.title,
            correct_answers: correct.map((o) => ({ id: o.id, text: o.text })),
            selected_answers: ans
              ? await StudentSessionRepo.getOptionTexts(ans.selected_option_ids)
              : [],
            is_correct: !!ans?.is_correct,
          };
        })
      );

      const leaderboard = await StudentSessionRepo.getLeaderboard(sessionId);

      res.json({
        score: data.studentSession.score ?? 0,
        total: questions.length,
        answers: detailed,
        leaderboard,
      });
    } catch (err) {
      console.error("GET RESULTS ERROR:", err);
      res.status(500).json({ error: "Server error." });
    }
  },

  async getHistory(req, res) {
    try {
      const history = await StudentSessionRepo.getStudentHistory(req.user.id);
      res.json({ history });
    } catch (err) {
      console.error("GET HISTORY ERROR:", err);
      res.status(500).json({ error: "Server error." });
    }
  },
};