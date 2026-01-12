const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");

const professorQuizRoutes = require("./routes/professorQuizRoutes");
const professorQuestionsRoutes = require("./routes/professorQuestionsRoutes");
const professorSessionRoutes = require("./routes/professorSessionRoutes");

const professorRoutes = require("./routes/professorRoutes");

const studentSessionRoutes = require("./routes/studentSessionRoutes");

const professorAIRoutes = require("./routes/professorAIRoutes");
const studentAIRoutes = require("./routes/studentAIRoutes");

const app = express();

app.use(
  cors({
    origin: "*",
    methods: "GET,POST,PUT,DELETE",
    allowedHeaders: "Content-Type,Authorization",
  })
);

app.use(express.json());

app.use("/auth", authRoutes);


app.use("/professor", professorQuizRoutes);

app.use("/professor", professorSessionRoutes);

app.use("/professor", professorRoutes);

app.use("/professor", professorQuestionsRoutes);

app.use("/student/session", studentSessionRoutes);

app.use("/ai/professor",professorAIRoutes);
app.use("/ai/student", studentAIRoutes);

module.exports = app;