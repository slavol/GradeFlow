const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const requireRole = require("../middleware/requireRole");

const QuestionCtrl = require("../controllers/ProfessorQuestionController");
const OptionCtrl = require("../controllers/ProfessorOptionController");

// -------------------- QUESTIONS --------------------

// CREATE question
router.post(
  "/quiz/:quizId/question/create",
  auth,
  requireRole("professor"),
  QuestionCtrl.createQuestion
);

// LIST questions for quiz
router.get(
  "/quiz/:quizId/questions",
  auth,
  requireRole("professor"),
  QuestionCtrl.listQuestions
);

// DELETE question
router.delete(
  "/quiz/:quizId/question/:questionId/delete",
  auth,
  requireRole("professor"),
  QuestionCtrl.deleteQuestion
);

// -------------------- OPTIONS --------------------

// CREATE option
router.post(
  "/quiz/:quizId/question/:questionId/option/create",
  auth,
  requireRole("professor"),
  OptionCtrl.createOption
);

// LIST options for question
router.get(
  "/quiz/:quizId/question/:questionId/options",
  auth,
  requireRole("professor"),
  OptionCtrl.listOptions
);

// DELETE option
router.delete(
  "/quiz/:quizId/question/:questionId/option/:optionId/delete",
  auth,
  requireRole("professor"),
  OptionCtrl.deleteOption
);

router.post(
  "/questions/bulk",
  auth,
  requireRole("professor"),
  QuestionCtrl.addMultipleQuestions
);

module.exports = router;