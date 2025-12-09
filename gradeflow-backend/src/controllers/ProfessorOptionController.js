const OptionRepository = require("../repositories/OptionRepository");

module.exports = {
  // ----------------------------------------------------
  // CREATE OPTION
  // ----------------------------------------------------
  createOption: async (req, res) => {
    try {
      const { questionId } = req.params;
      const { text, is_correct } = req.body;

      if (!text || text.trim() === "") {
        return res.status(400).json({ message: "Textul opțiunii este obligatoriu." });
      }

      const option = await OptionRepository.createOption(
        questionId,
        text,
        is_correct || false
      );

      res.json({
        message: "Option created",
        option,
      });

    } catch (err) {
      console.error("CREATE OPTION ERROR:", err);
      res.status(500).json({ message: "Server error" });
    }
  },

  // ----------------------------------------------------
  // LIST OPTIONS FOR A QUESTION
  // ----------------------------------------------------
  listOptions: async (req, res) => {
    try {
      const { questionId } = req.params;

      const options = await OptionRepository.getOptionsByQuestionId(questionId);

      res.json(options);

    } catch (err) {
      console.error("LIST OPTIONS ERROR:", err);
      res.status(500).json({ message: "Server error" });
    }
  },

  // ----------------------------------------------------
  // DELETE OPTION
  // ----------------------------------------------------
  deleteOption: async (req, res) => {
    try {
      const { optionId } = req.params;

      await OptionRepository.deleteOption(optionId);

      res.json({ message: "Option deleted" });

    } catch (err) {
      console.error("DELETE OPTION ERROR:", err);
      res.status(500).json({ message: "Server error" });
    }
  },

  // ----------------------------------------------------
  // UPDATE OPTION
  // ----------------------------------------------------
  updateOption: async (req, res) => {
    try {
      const { optionId } = req.params;
      const { text, is_correct } = req.body;

      if (!text || text.trim() === "") {
        return res.status(400).json({ message: "Textul opțiunii nu poate fi gol." });
      }

      const updated = await OptionRepository.updateOption(
        optionId,
        text,
        is_correct
      );

      res.json({
        message: "Option updated",
        option: updated,
      });

    } catch (err) {
      console.error("UPDATE OPTION ERROR:", err);
      res.status(500).json({ message: "Server error" });
    }
  }
};