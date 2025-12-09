const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");

const professorQuizRoutes = require("./routes/professorQuizRoutes");
const professorQuestionsRoutes = require("./routes/professorQuestionsRoutes");
const professorSessionRoutes = require("./routes/professorSessionRoutes");

const studentSessionRoutes = require("./routes/studentSessionRoutes");

const app = express();

app.use(
  cors({
    origin: "*",
    methods: "GET,POST,PUT,DELETE",
    allowedHeaders: "Content-Type,Authorization",
  })
);

app.use(express.json());

// 🔐 AUTH
app.use("/auth", authRoutes);

// ======================================================
// 🧑‍🏫 PROFESSOR ROUTES — ORDER MATTERS!
// ======================================================

// AUTH
app.use("/auth", authRoutes);

// PROFESSOR QUIZ CRUD + QUESTIONS (include /:quizId/questions)
app.use("/professor", professorQuizRoutes);

// PROFESSOR LIVE SESSION
app.use("/professor", professorSessionRoutes);

// IMPORTANT: OPTIONS & OLD QUESTIONS ROUTES LAST
app.use("/professor", professorQuestionsRoutes);

// ======================================================
// 🎓 STUDENT LIVE SESSION
// ======================================================
app.use("/student/session", studentSessionRoutes);

module.exports = app;