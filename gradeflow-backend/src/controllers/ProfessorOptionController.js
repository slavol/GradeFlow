const OptionRepository = require("../repositories/OptionRepository");

module.exports = {
  createOption: async (req, res) => {
    try {
      const { questionId } = req.params;
      const { text, is_correct } = req.body;

      if (!text) {
        return res.status(400).json({ message: "text este obligatoriu" });
      }

      const option = await OptionRepository.create(
        questionId,
        text,
        is_correct || false
      );

      res.json({ message: "Option created", option });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  },

  listOptions: async (req, res) => {
    try {
      const { questionId } = req.params;

      const result = await OptionRepository.getByQuestionId(questionId);
      res.json(result);

    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  },

  deleteOption: async (req, res) => {
    try {
      const { optionId, questionId } = req.params;

      await OptionRepository.delete(optionId, questionId);

      res.json({ message: "Option deleted" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }
};