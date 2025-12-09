const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const requireRole = require("../middleware/requireRole");

const StudentSessionController = require("../controllers/StudentSessionController");

// =====================================================
// ORDER MATTERS! Routes with fixed path BEFORE dynamic :id
// =====================================================

// POST /student/session/join  → student intră în sesiune
router.post(
  "/join",
  auth,
  requireRole("student"),
  StudentSessionController.joinSession
);

// GET /student/session/:id  → ia întrebarea curentă + status sesiune
router.get(
  "/:id",
  auth,
  requireRole("student"),
  StudentSessionController.getSessionData
);

// POST /student/session/:id/answer → trimite răspunsul la întrebare
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

module.exports = router;