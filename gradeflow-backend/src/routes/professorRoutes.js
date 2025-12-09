const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const requireRole = require("../middleware/requireRole");

const ProfessorController = require("../controllers/ProfessorController");

// ====================================================
// DASHBOARD STATS — Singura rută din acest fișier
// ====================================================
router.get(
  "/stats",
  auth,
  requireRole("professor"),
  ProfessorController.getDashboardStats
);

module.exports = router;