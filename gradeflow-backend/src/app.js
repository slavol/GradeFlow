const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
// const quizRoutes = require("./routes/quizRoutes");
// const resultRoutes = require("./routes/resultRoutes");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
// app.use("/quiz", quizRoutes);
// app.use("/results", resultRoutes);

module.exports = app;

