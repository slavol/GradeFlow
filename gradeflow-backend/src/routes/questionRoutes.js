const express = require("express");
const router = express.Router({ mergeParams: true });

const auth = require("../middleware/auth");
const requireRole = require("../middleware/requireRole");
const QuestionsController = require("../controllers/QuestionsController");

router.post(
  "/questions",
  auth,
  requireRole("professor"),
  QuestionsController.addMultipleQuestions
);

module.exports = router;