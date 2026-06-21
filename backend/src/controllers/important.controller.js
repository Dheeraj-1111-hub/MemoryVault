const importantService = require('../services/important/important.service');

exports.getDashboard = async (req, res) => {
  try {
    const data = await importantService.getImportantDashboard(req.user.id);
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
