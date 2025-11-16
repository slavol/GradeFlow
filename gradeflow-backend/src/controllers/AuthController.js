const db = require("../db/database");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// ---------------- REGISTER ----------------
exports.registerUser = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ message: "Missing fields" });
    }

    // Validare rol
    if (!["student", "professor"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    // Verifica dacă emailul există deja
    const existing = await db.query("SELECT * FROM users WHERE email = $1", [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Hash parola
    const hashed = await bcrypt.hash(password, 10);

    // Inserare
    const result = await db.query(
      "INSERT INTO users (email, password, role) VALUES ($1, $2, $3) RETURNING id, email, role",
      [email, hashed, role]
    );

    res.status(201).json({ message: "User created successfully", user: result.rows[0] });

  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ---------------- LOGIN ----------------
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await db.query("SELECT * FROM users WHERE email = $1", [email]);
    if (result.rows.length === 0) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const user = result.rows[0];

    // compara parolele
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Invalid credentials" });

    // Creează token cu rolul inclus
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login success",
      token,
      role: user.role
    });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
