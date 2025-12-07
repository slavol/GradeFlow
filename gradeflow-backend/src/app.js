const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const professorQuizRoutes = require("./routes/professorQuizRoutes");
const professorQuestionsRoutes = require("./routes/professorQuestionsRoutes");
const professorSessionRoutes = require("./routes/professorSessionRoutes");

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

// 🧑‍🏫 QUIZ MANAGEMENT (CRUD + VIEW + EDIT)
app.use("/professor", professorQuizRoutes);

// 🧑‍🏫 QUESTIONS & OPTIONS MANAGEMENT
app.use("/professor", professorQuestionsRoutes);

// 🧑‍🏫 LIVE SESSION (start / status / close)
app.use("/professor", professorSessionRoutes);



module.exports = app;