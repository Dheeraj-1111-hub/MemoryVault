const Document = require('../../models/Document');
const TimelineEvent = require('../../models/TimelineEvent');
const Notification = require('../../models/Notification');

exports.checkWeeklyDigest = async (userId) => {
  // 1 week ago date
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  // Next 7 days
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);

  const [newDocsCount, upcomingDeadlines, allDocs] = await Promise.all([
    Document.countDocuments({ userId, uploadDate: { $gte: oneWeekAgo } }),
    TimelineEvent.countDocuments({ userId, date: { $gte: new Date(), $lte: nextWeek } }),
    Document.find({ userId }).select('category').lean()
  ]);

  // Check missing core docs
  const hasPan = allDocs.some(d => (d.category || '').toLowerCase() === 'identity');
  const hasResume = allDocs.some(d => (d.category || '').toLowerCase() === 'education' || (d.category || '').toLowerCase() === 'placement notice');
  
  let missingDocs = 0;
  if (!hasPan) missingDocs++;
  if (!hasResume) missingDocs++;

  let body = `This Week In Your Vault\n• ${newDocsCount} New Document${newDocsCount !== 1 ? 's' : ''}\n• ${upcomingDeadlines} Upcoming Deadline${upcomingDeadlines !== 1 ? 's' : ''}`;
  
  if (missingDocs > 0) {
    body += `\n• ${missingDocs} Core Document${missingDocs > 1 ? 's' : ''} Missing`;
  }

  if (!hasResume) {
    body += `\n⚠ Resume not updated`;
  }

  // Only send digest if there's actually something to report
  if (newDocsCount > 0 || upcomingDeadlines > 0 || missingDocs > 0) {
    // Avoid spamming this too often (check if one was created in the last 6 days)
    const recentDigest = await Notification.findOne({
      userId,
      title: 'Weekly AI Digest',
      createdAt: { $gte: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000) }
    });

    if (!recentDigest) {
      await Notification.create({
        userId,
        type: 'insight',
        title: 'Weekly AI Digest',
        message: body,
        priority: 'low',
        actionLink: '/'
      });
    }
  }
};
