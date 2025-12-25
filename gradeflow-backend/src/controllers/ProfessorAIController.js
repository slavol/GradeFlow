const { extractText } = require("../utils/documentParser");
const { generateQuestionsFromText } = require("../services/geminiService");

module.exports = {
  async generateFromDocument(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const text = await extractText(req.file);

      if (!text || text.length < 100) {
        return res.status(400).json({ error: "Document too short or unreadable" });
      }

      const questions = await generateQuestionsFromText(text);

      return res.json({ success: true, questions });
    } catch (err) {
      console.error("AI GENERATION ERROR:", err);
      return res.status(500).json({ error: err.message || "AI generation failed" });
    }
  },
};