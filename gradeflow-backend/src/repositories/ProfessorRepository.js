const pool = require("../db/database");

class ProfessorRepository {

  // =============================
  //  GET DASHBOARD STATISTICS
  // =============================
  static async getDashboardStats(professorId) {
    // total quizzes created
    const quizCountRes = await pool.query(
      `SELECT COUNT(*) 
       FROM quizzes 
       WHERE professor_id = $1`,
      [professorId]
    );

    // total questions written
    const questionCountRes = await pool.query(
      `SELECT COUNT(*) 
       FROM questions q
       JOIN quizzes qz ON qz.id = q.quiz_id
       WHERE qz.professor_id = $1`,
      [professorId]
    );

    // total students graded (distinct)
    const studentsRes = await pool.query(
      `SELECT COUNT(DISTINCT ss.student_id) 
       FROM student_sessions ss
       JOIN quiz_sessions s ON s.id = ss.session_id
       WHERE s.professor_id = $1`,
      [professorId]
    );

    return {
      total_quizzes: Number(quizCountRes.rows[0].count),
      total_questions: Number(questionCountRes.rows[0].count),
      total_students: Number(studentsRes.rows[0].count),
    };
  }
}

module.exports = ProfessorRepository;