const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const professorRoutes = require("./routes/professorQuizRoutes");
const professorQuestionsRoutes = require("./routes/professorQuestionsRoutes");

const app = express();

app.use(cors({
  origin: "*",
  methods: "GET,POST,PUT,DELETE",
  allowedHeaders: "Content-Type,Authorization",
}));
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/professor", professorRoutes);
app.use("/professor", professorQuestionsRoutes);

module.exports = app;