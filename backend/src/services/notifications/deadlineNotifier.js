const TimelineEvent = require('../../models/TimelineEvent');
const Notification = require('../../models/Notification');

exports.checkDeadlines = async (userId) => {
  const now = new Date();
  // Look 3 days ahead
  const future = new Date(now.getTime() + (3 * 24 * 60 * 60 * 1000));
  
  const events = await TimelineEvent.find({
    userId,
    date: { $gte: now, $lte: future },
    priority: { $in: ['high', 'medium'] }
  }).lean();

  for (const event of events) {
    const diffTime = Math.abs(new Date(event.date) - now);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    let timeStr = diffDays === 0 ? 'today' : `in ${diffDays} day${diffDays > 1 ? 's' : ''}`;
    
    // Create a unique reference ID so we don't spam the same notification
    const referenceId = `deadline_${event._id}_${diffDays}`;
    
    try {
      await Notification.updateOne(
        { referenceId },
        {
          $setOnInsert: {
            userId,
            title: 'Upcoming Deadline',
            message: `${event.title} is due ${timeStr}.`,
            type: 'deadline',
            priority: event.priority === 'high' ? 'high' : 'medium',
            actionLink: '/timeline'
          }
        },
        { upsert: true }
      );
    } catch (e) {
      // Ignore duplicate key errors if they happen
    }
  }
};
