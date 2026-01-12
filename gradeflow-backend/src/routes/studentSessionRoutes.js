const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const requireRole = require("../middleware/requireRole");

const StudentSessionController = require("../controllers/StudentSessionController");
const StudentAIController= require("../controllers/StudentAIController")


router.post(
  "/join",
  auth,
  requireRole("student"),
  StudentSessionController.joinSession
);

router.get(
  "/history",
  auth,
  requireRole("student"),
  StudentSessionController.getHistory
);

router.get(
  "/:id",
  auth,
  requireRole("student"),
  StudentSessionController.getSessionData
);

router.post(
  "/:id/answer",
  auth,
  requireRole("student"),
  StudentSessionController.submitAnswer
);

router.get(
  "/:id/results",
  auth,
  requireRole("student"),
  StudentSessionController.getResults
);

router.post(
  "/:id/answer/all",
  auth,
  requireRole("student"),
  StudentSessionController.submitAllAnswers
);

router.post(
  "/:sessionId/explanation/:questionId",
  auth,
  requireRole("student"),
  StudentAIController.explainWrongAnswer
);


module.exports = router;