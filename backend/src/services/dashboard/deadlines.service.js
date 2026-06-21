const TimelineEvent = require('../../models/TimelineEvent');

exports.getUpcomingDeadlines = async (userId) => {
  const now = new Date();
  // Set to start of today to ensure we don't miss anything due today
  now.setHours(0, 0, 0, 0);
  
  const events = await TimelineEvent.find({ 
    userId,
    date: { $gte: now },
    priority: { $in: ['high', 'medium'] } 
  })
  .populate('sourceDocumentId', 'title kind _id')
  .sort({ date: 1 })
  .limit(3)
  .lean();

  let allDeadlines = [];

  events.forEach(event => {
    // Calculate relative time
    const diffTime = Math.abs(new Date(event.date) - now);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const inText = diffDays === 0 ? 'Today' : `${diffDays} day${diffDays > 1 ? 's' : ''} left`;

    allDeadlines.push({
      id: event._id,
      title: event.title,
      date: event.dateStr,
      in: inText,
      source: event.sourceDocumentId?._id
    });
  });

  return allDeadlines;
};
