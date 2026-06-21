const TimelineEvent = require('../../models/TimelineEvent');

exports.getTimeline = async (userId, category) => {
  const query = { userId };
  if (category && category !== 'All') {
    query.category = category;
  }
  
  const events = await TimelineEvent.find(query)
    .populate('sourceDocumentId', 'title kind filePath')
    .sort({ date: 1 })
    .lean();
    
  return events;
};

exports.getUpcoming = async (userId) => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const events = await TimelineEvent.find({ userId, date: { $gte: now } })
    .populate('sourceDocumentId', 'title kind filePath')
    .sort({ date: 1 })
    .limit(10)
    .lean();
    
  return events;
};

exports.getHistory = async (userId) => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const events = await TimelineEvent.find({ userId, date: { $lt: now } })
    .populate('sourceDocumentId', 'title kind filePath')
    .sort({ date: -1 })
    .limit(20)
    .lean();
    
  return events;
};
