const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const requireRole = require("../middleware/requireRole");

const ProfessorQuizController = require("../controllers/ProfessorQuizController");
const QuestionsEditController = require("../controllers/QuestionsEditController");

const questionsRoutes = require("./questionRoutes");


router.post(
  "/create",
  auth,
  requireRole("professor"),
  ProfessorQuizController.createQuiz
);

router.get(
  "/list",
  auth,
  requireRole("professor"),
  ProfessorQuizController.listQuizzes
);

router.delete(
  "/delete/:id",
  auth,
  requireRole("professor"),
  ProfessorQuizController.deleteQuiz
);


router.get(
  "/quiz/:id",
  auth,
  requireRole("professor"),
  ProfessorQuizController.getQuizById
);

router.put(
  "/quiz/:id",
  auth,
  requireRole("professor"),
  ProfessorQuizController.updateQuiz
);

router.put(
  "/quiz/:id/questions",
  auth,
  requireRole("professor"),
  QuestionsEditController.updateQuestions
);


router.use(
  "/quiz/:quizId",
  questionsRoutes
);

router.post(
  "/quiz/:id/questions",
  auth,
  requireRole("professor"),
  QuestionsEditController.addFullQuestions
);

module.exports = router;