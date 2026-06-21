const dashboardService = require('../services/dashboard/dashboard.service');

exports.getDashboardData = async (req, res) => {
  try {
    const data = await dashboardService.getDashboardData(req.user.id);
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
