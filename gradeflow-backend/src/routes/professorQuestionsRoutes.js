const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const requireRole = require("../middleware/requireRole");

const QuestionCtrl = require("../controllers/ProfessorQuestionController");
const OptionCtrl = require("../controllers/ProfessorOptionController");

// QUESTIONS
router.post("/quiz/:quizId/question/create", auth, requireRole("professor"), QuestionCtrl.createQuestion);
router.get("/quiz/:quizId/questions", auth, requireRole("professor"), QuestionCtrl.listQuestions);
router.delete("/quiz/question/:questionId/delete", auth, requireRole("professor"), QuestionCtrl.deleteQuestion);

// OPTIONS
router.post("/quiz/question/:questionId/option/create", auth, requireRole("professor"), OptionCtrl.createOption);
router.get("/quiz/question/:questionId/options", auth, requireRole("professor"), OptionCtrl.listOptions);
router.delete("/quiz/question/:questionId/option/:optionId/delete", auth, requireRole("professor"), OptionCtrl.deleteOption);

module.exports = router;