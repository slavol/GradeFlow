const pool = require("../db/database");

class QuizRepository {

  static async create(professorId, title, description, timeLimit, creationType) {
    const joinCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    const result = await pool.query(
      `INSERT INTO quizzes (professor_id, title, description, time_limit, creation_type, join_code)
       VALUES ($1,$2,$3,$4,$5,$6)
       RETURNING *`,
      [professorId, title, description, timeLimit, creationType, joinCode]
    );

    return result.rows[0];
  }

  static async getByProfessorId(professorId) {
    const result = await pool.query(
      `SELECT * FROM quizzes WHERE professor_id = $1 ORDER BY created_at DESC`,
      [professorId]
    );
    return result.rows;
  }

  static async delete(id, professorId) {
    await pool.query(
      `DELETE FROM quizzes WHERE id = $1 AND professor_id = $2`,
      [id, professorId]
    );
  }

  static async findById(id, professorId) {
    console.log("🔎 QuizRepository.findById", { id, professorId });

    const result = await pool.query(
      `SELECT * FROM quizzes WHERE id = $1 AND professor_id = $2`,
      [id, professorId]
    );

    console.log("📌 Query result:", result.rows);

    return result.rows[0];
  }

  static async updateQuizMeta(id, professorId, title, description, time_limit) {
    const result = await pool.query(
      `UPDATE quizzes 
       SET title=$1, description=$2, time_limit=$3
       WHERE id=$4 AND professor_id=$5
       RETURNING *`,
      [title, description, time_limit, id, professorId]
    );
    return result.rows[0];
  }
}

module.exports = QuizRepository;