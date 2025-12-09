const pool = require("../db/database");

class StudentSessionRepository {

  // ======================================================
  // STUDENT JOINS SESSION
  // ======================================================
  static async joinSession(sessionCode, studentId) {
    const sessionRes = await pool.query(
      `SELECT * FROM quiz_sessions 
       WHERE session_code = $1 AND status = 'active'`,
      [sessionCode]
    );

    if (sessionRes.rows.length === 0) return null;

    const session = sessionRes.rows[0];

    // Student already joined?
    const exists = await pool.query(
      `SELECT * FROM student_sessions
       WHERE session_id = $1 AND student_id = $2`,
      [session.id, studentId]
    );

    if (exists.rows.length > 0) {
      return { session, studentSession: exists.rows[0] };
    }

    // New student session
    const newSession = await pool.query(
      `INSERT INTO student_sessions (session_id, student_id)
       VALUES ($1, $2)
       RETURNING *`,
      [session.id, studentId]
    );

    return { session, studentSession: newSession.rows[0] };
  }

  // ======================================================
  // GET SESSION + STUDENT SESSION
  // ======================================================
  static async getStudentSession(sessionId, studentId) {
    const sessionRes = await pool.query(
      `SELECT * FROM quiz_sessions WHERE id = $1`,
      [sessionId]
    );

    if (sessionRes.rows.length === 0) return null;

    const session = sessionRes.rows[0];

    const stuRes = await pool.query(
      `SELECT * FROM student_sessions
       WHERE session_id = $1 AND student_id = $2`,
      [sessionId, studentId]
    );

    if (stuRes.rows.length === 0) {
      return { session, studentSession: null };
    }

    return { session, studentSession: stuRes.rows[0] };
  }

  // ======================================================
  // GET TIME LIMIT FOR QUIZ (FROM QUIZ TABLE)
  // ======================================================
  static async getQuizTimeLimit(sessionId) {
    const res = await pool.query(
      `SELECT q.time_limit
       FROM quizzes q
       JOIN quiz_sessions qs ON qs.quiz_id = q.id
       WHERE qs.id = $1`,
      [sessionId]
    );

    if (res.rows.length === 0) return 0;
    return res.rows[0].time_limit || 0;
  }

  // ======================================================
  // GET QUIZ QUESTIONS
  // ======================================================
  static async getQuizQuestions(sessionId) {
    const res = await pool.query(
      `SELECT q.*
       FROM questions q
       WHERE q.quiz_id = (
         SELECT quiz_id FROM quiz_sessions WHERE id = $1
       )
       ORDER BY position ASC`,
      [sessionId]
    );

    return res.rows;
  }

  // ======================================================
  // GET OPTIONS FOR A QUESTION
  // ======================================================
  static async getQuestionOptions(questionId) {
    const res = await pool.query(
      `SELECT * FROM options WHERE question_id = $1`,
      [questionId]
    );
    return res.rows;
  }

  // ======================================================
  // CHECK IF A STUDENT ALREADY ANSWERED A QUESTION
  // ======================================================
  static async hasAnswered(studentSessionId, questionId) {
    const res = await pool.query(
      `SELECT 1 FROM student_answers
       WHERE student_session_id = $1 AND question_id = $2`,
      [studentSessionId, questionId]
    );

    return res.rows.length > 0;
  }

  // ======================================================
  // SAVE ANSWER
  // ======================================================
  static async saveAnswer(studentSessionId, questionId, selectedIds, isCorrect) {
    await pool.query(
      `INSERT INTO student_answers (student_session_id, question_id, selected_option_ids, is_correct)
       VALUES ($1, $2, $3, $4)`,
      [studentSessionId, questionId, selectedIds, isCorrect]
    );
  }

  // ======================================================
  // INCREMENT SCORE
  // ======================================================
  static async incrementScore(studentSessionId) {
    await pool.query(
      `UPDATE student_sessions
       SET score = score + 1
       WHERE id = $1`,
      [studentSessionId]
    );
  }

  // ======================================================
  // ADVANCE QUESTION INDEX
  // ======================================================
  static async advanceQuestion(studentSessionId) {
    await pool.query(
      `UPDATE student_sessions
       SET current_index = current_index + 1
       WHERE id = $1`,
      [studentSessionId]
    );
  }

  // ======================================================
  // MARK SESSION AS COMPLETED
  // ======================================================
  static async markCompleted(studentSessionId) {
    await pool.query(
      `UPDATE student_sessions
       SET completed = true,
           finished_at = NOW()
       WHERE id = $1`,
      [studentSessionId]
    );
  }

  // ======================================================
  // GET CORRECT OPTION IDS
  // ======================================================
  static async getCorrectOptionIds(questionId) {
    const res = await pool.query(
      `SELECT id FROM options 
       WHERE question_id = $1 AND is_correct = true`,
      [questionId]
    );
    return res.rows.map((r) => r.id);
  }

  static async getSelectedOptionIds(studentSessionId, questionId) {
    const res = await pool.query(
      `SELECT selected_option_ids 
     FROM student_answers 
     WHERE student_session_id = $1 AND question_id = $2`,
      [studentSessionId, questionId]
    );

    if (res.rows.length === 0) return [];

    return res.rows[0].selected_option_ids || [];
  }

  // ----------------------------------
  // Get student's answers
  // ----------------------------------
  static async getStudentAnswers(studentSessionId) {
    const res = await pool.query(
      `SELECT * FROM student_answers
     WHERE student_session_id = $1`,
      [studentSessionId]
    );
    return res.rows;
  }

  // ----------------------------------
  // Leaderboard for the session
  // ----------------------------------
  static async getLeaderboard(sessionId) {
    const res = await pool.query(
      `SELECT 
        u.email,
        ss.score,
        ss.completed,
        ss.finished_at
     FROM student_sessions ss
     JOIN users u ON u.id = ss.student_id
     WHERE ss.session_id = $1
     ORDER BY ss.score DESC, ss.finished_at ASC NULLS LAST`,
      [sessionId]
    );

    return res.rows;
  }

  static async getQuizTimeLimit(sessionId) {
    const res = await pool.query(
      `SELECT q.time_limit
     FROM quizzes q
     JOIN quiz_sessions s ON s.quiz_id = q.id
     WHERE s.id = $1`,
      [sessionId]
    );

    return res.rows.length ? res.rows[0].time_limit : 0;
  }

  static async getOptionTexts(optionIds) {
    if (!optionIds || optionIds.length === 0) return [];

    const res = await pool.query(
      `SELECT id, text FROM options WHERE id = ANY($1)`,
      [optionIds]
    );

    return res.rows;
  }

// =====================================================
// GET STUDENT RESULT HISTORY
// =====================================================
static async getStudentHistory(studentId) {
  const res = await pool.query(
    `
    SELECT 
      ss.id AS student_session_id,
      ss.session_id,
      ss.score,
      ss.completed,
      ss.finished_at,
      q.title AS quiz_title,
      q.id AS quiz_id
    FROM student_sessions ss
    JOIN quiz_sessions qs ON ss.session_id = qs.id
    JOIN quizzes q ON qs.quiz_id = q.id
    WHERE ss.student_id = $1
    ORDER BY ss.finished_at DESC NULLS LAST
    `,
    [studentId]
  );

  return res.rows;
}



}

module.exports = StudentSessionRepository;