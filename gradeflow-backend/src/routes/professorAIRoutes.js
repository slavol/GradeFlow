const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const requireRole = require("../middleware/requireRole");
const upload = require("../middleware/upload");

const ProfessorAIController = require("../controllers/ProfessorAIController");

function debugUpload(req, res, next) {
  console.log("=== AI UPLOAD DEBUG ===");
  console.log("content-type:", req.headers["content-type"]);
  console.log("body keys:", Object.keys(req.body || {}));
  console.log("file:", req.file ? {
    fieldname: req.file.fieldname,
    originalname: req.file.originalname,
    mimetype: req.file.mimetype,
    size: req.file.size,
  } : null);
  console.log("=======================");
  next();
}

router.post(
  "/generate-questions",
  auth,
  requireRole("professor"),
  upload.single("file"),     
  debugUpload,               
  ProfessorAIController.generateFromDocument
);

module.exports = router;