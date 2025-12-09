const ProfessorRepository = require("../repositories/ProfessorRepository");

module.exports = {
  async getDashboardStats(req, res) {
    try {
      const professorId = req.user.id;

      const stats = await ProfessorRepository.getDashboardStats(professorId);

      return res.json(stats);
    } catch (err) {
      console.error("GET DASHBOARD STATS ERROR:", err);
      return res.status(500).json({ error: "Server error" });
    }
  }
};