const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const requireRole = require("../middleware/requireRole");
const StudentAIController = require("../controllers/StudentAIController");

router.post(
  "/explain-question",
  auth,
  requireRole("student"),
  StudentAIController.explainWrongAnswer
);

module.exports = router;