const StudentSessionRepo = require("../repositories/StudentSessionRepository");
const QuizRepository = require("../repositories/QuizRepository");

module.exports = {
  // =====================================================
  // STUDENT JOIN SESSION
  // =====================================================
  // =====================================================
  // LOAD SESSION DATA (current question + timer)
  // =====================================================
  // =====================================================
  // STUDENT JOIN SESSION
  // =====================================================
  async joinSession(req, res) {
    try {
      const { session_code } = req.body;
      const studentId = req.user.id;

      if (!session_code) {
        return res.status(400).json({ error: "Codul sesiunii este necesar." });
      }

      // repo verifică dacă sesiunea există și dacă studentul poate intra
      const result = await StudentSessionRepo.joinSession(session_code, studentId);

      if (!result) {
        return res.status(404).json({ error: "Sesiune invalidă sau deja închisă." });
      }

      const { session, studentSession } = result;

      return res.json({
        success: true,
        session_id: session.id,
        student_session_id: studentSession.id,
      });

    } catch (err) {
      console.error("JOIN SESSION ERROR:", err);
      return res.status(500).json({ error: "Eroare server." });
    }
  },


  async getSessionData(req, res) {
    try {
      const sessionId = req.params.id;
      const studentId = req.user.id;

      // 1. session + student_session
      let data = await StudentSessionRepo.getStudentSession(sessionId, studentId);
      if (!data || !data.session) {
        return res.status(404).json({ error: "Sesiunea nu există." });
      }

      const { session, studentSession } = data;

      if (!studentSession) {
        return res.status(403).json({ error: "Nu ești parte din această sesiune." });
      }

      // 2. TIME LIMIT din QUIZ
      const quiz = await QuizRepository.findById(session.quiz_id);
      const timeLimitMinutes = quiz?.time_limit || 0;

      let time_left = null;

      if (timeLimitMinutes > 0) {
        const started = new Date(studentSession.started_at);
        const now = new Date();

        const elapsedSec = Math.floor((now - started) / 1000);
        const totalSec = timeLimitMinutes * 60;

        time_left = Math.max(totalSec - elapsedSec, 0);

        if (time_left === 0) {
          await StudentSessionRepo.markCompleted(studentSession.id);
          return res.json({
            finished: true,
            score: studentSession.score,
          });
        }
      }

      // Student a terminat deja
      if (studentSession.completed) {
        return res.json({
          finished: true,
          score: studentSession.score,
          time_left,
        });
      }

      // 3. Întrebările
      const questions = await StudentSessionRepo.getQuizQuestions(sessionId);

      if (questions.length === 0) {
        return res.json({ error: "Quiz-ul nu are întrebări." });
      }

      const currentIndex = studentSession.current_index;

      if (currentIndex >= questions.length) {
        await StudentSessionRepo.markCompleted(studentSession.id);
        return res.json({
          finished: true,
          score: studentSession.score,
        });
      }

      let question = questions[currentIndex];

      question = {
        id: question.id,
        text: question.title,
        question_type: question.question_type
      };

      const options = await StudentSessionRepo.getQuestionOptions(question.id);

      // ————————————————————————————————
      // FIX IMPORTANT — verificare răspuns existent
      // ————————————————————————————————
      const alreadyAnswered = await StudentSessionRepo.hasAnswered(
        studentSession.id,
        question.id
      );

      let selected_option_ids = [];

      if (alreadyAnswered) {
        selected_option_ids = await StudentSessionRepo.getSelectedOptionIds(
          studentSession.id,
          question.id
        );
      }

      return res.json({
        session,
        studentSession,
        question,
        options,
        selected_option_ids,
        time_left,
      });

    } catch (err) {
      console.error("GET SESSION DATA ERROR:", err);
      return res.status(500).json({ error: "Server error." });
    }
  },

  // =====================================================
  // SUBMIT ANSWER
  // =====================================================
  async submitAnswer(req, res) {
    try {
      const sessionId = req.params.id;
      const studentId = req.user.id;
      const { question_id, selected_option_ids } = req.body;

      if (!Array.isArray(selected_option_ids) || selected_option_ids.length === 0) {
        return res.status(400).json({ error: "Trebuie să selectezi cel puțin o opțiune." });
      }

      const data = await StudentSessionRepo.getStudentSession(sessionId, studentId);
      const studentSession = data?.studentSession;

      if (!studentSession) {
        return res.status(403).json({ error: "Nu ești parte din această sesiune." });
      }

      // TIMP EXPIRAT? Nu permitem răspuns.
      const quiz = await QuizRepository.findById(data.session.quiz_id, data.session.professor_id);
      const limit = quiz?.time_limit || 0;

      if (limit > 0) {
        const started = new Date(studentSession.started_at);
        const now = new Date();
        const elapsed = Math.floor((now - started) / 1000);

        if (elapsed >= limit * 60) {
          await StudentSessionRepo.markCompleted(studentSession.id);
          return res.status(403).json({ error: "Timpul a expirat." });
        }
      }

      // Răspuns corect?
      const correctIds = await StudentSessionRepo.getCorrectOptionIds(question_id);

      const sortedCorrect = [...correctIds].sort((a, b) => a - b);
      const sortedGiven = [...selected_option_ids].sort((a, b) => a - b);

      const isCorrect = JSON.stringify(sortedCorrect) === JSON.stringify(sortedGiven);

      await StudentSessionRepo.saveAnswer(
        studentSession.id,
        question_id,
        selected_option_ids,
        isCorrect
      );

      if (isCorrect) {
        await StudentSessionRepo.incrementScore(studentSession.id);
      }

      await StudentSessionRepo.advanceQuestion(studentSession.id);

      return res.json({
        success: true,
        correct: isCorrect,
      });
    } catch (err) {
      console.error("SUBMIT ANSWER ERROR:", err);
      return res.status(500).json({ error: "Server error." });
    }
  },

  // =====================================================
  // GET SESSION RESULTS FOR STUDENT
  // =====================================================
  async getResults(req, res) {
    try {
      const sessionId = req.params.id;
      const studentId = req.user.id;

      // 1. student session
      const data = await StudentSessionRepo.getStudentSession(sessionId, studentId);
      const session = data?.session;
      const studentSession = data?.studentSession;

      if (!session || !studentSession) {
        return res.status(404).json({ error: "Sesiunea nu există." });
      }

      // student must be finished
      if (!studentSession.completed) {
        return res.status(403).json({ error: "Quiz-ul nu este încă terminat." });
      }

      // 2. total questions
      const questions = await StudentSessionRepo.getQuizQuestions(sessionId);
      const totalQuestions = questions.length;

      // 3. student answers
      const answers = await StudentSessionRepo.getStudentAnswers(studentSession.id);

      // match each question + correct option + student's selection
      const detailedResults = await Promise.all(
  questions.map(async (q) => {
    const opts = await StudentSessionRepo.getQuestionOptions(q.id);

    const correct = opts.filter(o => o.is_correct);
    const answer = answers.find(a => a.question_id === q.id);

    const selected = answer
      ? await StudentSessionRepo.getOptionTexts(answer.selected_option_ids)
      : [];

    return {
      question_id: q.id,
      question_text: q.title,

      correct_answers: correct.map(o => ({
        id: o.id,
        text: o.text
      })),

      selected_answers: selected.map(o => ({
        id: o.id,
        text: o.text
      })),

      is_correct: answer?.is_correct || false
    };
  })
);

      // 4. leaderboard
      const leaderboard = await StudentSessionRepo.getLeaderboard(sessionId);

      return res.json({
        session,
        score: studentSession.score,
        total: totalQuestions,
        answers: detailedResults,
        leaderboard
      });

    } catch (err) {
      console.error("GET RESULTS ERROR:", err);
      return res.status(500).json({ error: "Server error." });
    }
  }
};