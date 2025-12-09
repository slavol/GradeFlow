const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");

const professorQuizRoutes = require("./routes/professorQuizRoutes");
const professorQuestionsRoutes = require("./routes/professorQuestionsRoutes");
const professorSessionRoutes = require("./routes/professorSessionRoutes");

// 👇 NEW (stats)
const professorRoutes = require("./routes/professorRoutes");

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

// QUIZ CRUD
app.use("/professor", professorQuizRoutes);

// SESSION MANAGEMENT
app.use("/professor", professorSessionRoutes);

// NEW: PROFESSOR DASHBOARD STATS ( /professor/stats )
app.use("/professor", professorRoutes);

// OPTIONS & OLD QUESTIONS ROUTES LAST
app.use("/professor", professorQuestionsRoutes);

// ======================================================
// 🎓 STUDENT LIVE SESSION
// ======================================================
app.use("/student/session", studentSessionRoutes);

module.exports = app;