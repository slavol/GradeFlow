const db = require("../db/database")

class UserRepository {
  async create(email, password, role) {
    const result = await db.query(
      "INSERT INTO users (email, password, role) VALUES ($1, $2, $3) RETURNING id, email, role",
      [email, password, role]
    );
    return result.rows[0];
  }

  async findByEmail(email) {
    const result = await db.query("SELECT * FROM users WHERE email = $1", [email]);
    return result.rows[0];
  }
}

module.exports = new UserRepository();