const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const requireRole = require("../middleware/requireRole");

const QuestionCtrl = require("../controllers/ProfessorQuestionController");
const OptionCtrl = require("../controllers/ProfessorOptionController");


router.post(
  "/quiz/:quizId/question/create",
  auth,
  requireRole("professor"),
  QuestionCtrl.createQuestion
);

router.get(
  "/quiz/:quizId/questions",
  auth,
  requireRole("professor"),
  QuestionCtrl.listQuestions
);

router.delete(
  "/quiz/:quizId/question/:questionId/delete",
  auth,
  requireRole("professor"),
  QuestionCtrl.deleteQuestion
);


router.post(
  "/quiz/:quizId/question/:questionId/option/create",
  auth,
  requireRole("professor"),
  OptionCtrl.createOption
);

router.get(
  "/quiz/:quizId/question/:questionId/options",
  auth,
  requireRole("professor"),
  OptionCtrl.listOptions
);

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