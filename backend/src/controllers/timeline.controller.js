const timelineService = require('../services/timeline/timeline.service');

exports.getTimeline = async (req, res) => {
  try {
    const events = await timelineService.getTimeline(req.user.id, req.query.category);
    res.status(200).json({ success: true, events });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getUpcoming = async (req, res) => {
  try {
    const events = await timelineService.getUpcoming(req.user.id);
    res.status(200).json({ success: true, events });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const events = await timelineService.getHistory(req.user.id);
    res.status(200).json({ success: true, events });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
