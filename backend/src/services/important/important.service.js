const { analyzeIdentity } = require('./identity.service');
const { analyzeEducation } = require('./education.service');
const { analyzeFinance } = require('./finance.service');
const { analyzePlacement } = require('./placement.service');
const { aggregateMissingAndAlerts } = require('./completeness.service');
const TimelineEvent = require('../../models/TimelineEvent');

exports.getImportantDashboard = async (userId) => {
  const [identity, education, finance, placement] = await Promise.all([
    analyzeIdentity(userId),
    analyzeEducation(userId),
    analyzeFinance(userId),
    analyzePlacement(userId)
  ]);

  const { missing, alerts } = aggregateMissingAndAlerts(identity, education, finance, placement);

  // Get additional alerts from Timeline (e.g. expiring soon, due soon)
  const now = new Date();
  const upcomingEvents = await TimelineEvent.find({ 
    userId,
    date: { $gte: now },
    priority: 'high'
  }).sort({ date: 1 }).limit(5).lean();

  upcomingEvents.forEach(e => {
    const diffTime = Math.abs(new Date(e.date) - now);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    alerts.push(`${e.title} in ${diffDays} day${diffDays > 1 ? 's' : ''}`);
  });

  return {
    sections: {
      identity,
      education,
      finance,
      placement
    },
    missing,
    alerts
  };
};
