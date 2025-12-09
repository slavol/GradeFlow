const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const requireRole = require("../middleware/requireRole");

const ProfessorSessionController = require("../controllers/ProfessorSessionController");
const ProfessorResultsController = require("../controllers/ProfessorResultsController");
const ProfessorSessionHistoryController= require("../controllers/ProfessorSessionHistoryController");

// START SESSION
router.post(
  "/quiz/:id/start",
  auth,
  requireRole("professor"),
  ProfessorSessionController.startSession
);

// GET LIVE SESSION STATUS
router.get(
  "/session/:id",
  auth,
  requireRole("professor"),
  ProfessorSessionController.getSession
);

// CLOSE SESSION
router.post(
  "/session/:id/close",
  auth,
  requireRole("professor"),
  ProfessorSessionController.closeSession
);

router.get(
  "/session/:id/results",
  auth,
  requireRole("professor"),
  ProfessorResultsController.getResults
);

router.get(
  "/sessions/history",
  auth,
  requireRole("professor"),
  ProfessorSessionHistoryController.getHistory
);

router.delete(
  "/session/:id/delete",
  auth,
  requireRole("professor"),
  ProfessorSessionHistoryController.deleteSession
);

router.get(
  "/session/:id/export",
  auth,
  requireRole("professor"),
  ProfessorSessionController.exportCSV
);

module.exports = router;