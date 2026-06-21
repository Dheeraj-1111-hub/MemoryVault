const askMemoryService = require('../services/chat/askMemory.service');

exports.askQuestion = async (req, res) => {
  try {
    const { threadId, question } = req.body;
    if (!threadId || !question) return res.status(400).json({ success: false, message: 'Missing threadId or question' });

    const aiMessage = await askMemoryService.askQuestion(req.user.id, threadId, question);
    res.status(200).json({ success: true, message: aiMessage });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getThreadHistory = async (req, res) => {
  try {
    const { threadId } = req.params;
    const history = await askMemoryService.getThreadHistory(req.user.id, threadId);
    res.status(200).json({ success: true, messages: history });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
