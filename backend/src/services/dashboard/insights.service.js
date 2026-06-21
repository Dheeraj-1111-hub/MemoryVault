const Notification = require('../../models/Notification');

exports.getInsights = async (userId) => {
  const insights = [];
  
  // Pull up to 4 unread notifications
  const notifications = await Notification.find({ userId, isRead: false })
    .sort({ priority: 1, createdAt: -1 })
    .limit(4)
    .lean();

  if (notifications.length === 0) {
    insights.push({
      type: "important",
      title: "All caught up",
      body: "You have no pending deadlines or missing documents.",
      docId: null
    });
    return insights;
  }

  notifications.forEach(n => {
    let insightType = "important";
    if (n.type === 'deadline') insightType = "deadline";
    if (n.type === 'missing') insightType = "money"; // just reusing existing icons on frontend
    if (n.type === 'stale') insightType = "stale";

    insights.push({
      type: insightType,
      title: n.title,
      body: n.message,
      docId: n.actionLink // Frontend will need to handle this if it's a link instead of docId
    });
  });

  return insights;
};
