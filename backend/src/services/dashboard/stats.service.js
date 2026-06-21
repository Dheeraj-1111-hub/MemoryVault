const Document = require('../../models/Document');

exports.getStats = async (userId) => {
  const mongoose = require('mongoose');
  const uid = new mongoose.Types.ObjectId(userId);
  
  const [counts, storage] = await Promise.all([
    Document.aggregate([
      { $match: { userId: uid } },
      { $group: { _id: '$kind', count: { $sum: 1 } } }
    ]),
    Document.aggregate([
      { $match: { userId: uid } },
      { $group: { _id: null, totalBytes: { $sum: '$fileSize' } } }
    ])
  ]);

  const stats = {
    documents: 0,
    screenshots: 0,
    emails: 0,
    storageMb: 0,
    upcomingDeadlines: 0
  };

  counts.forEach(c => {
    if (c._id === 'pdf') stats.documents = c.count;
    if (c._id === 'image') stats.screenshots = c.count;
    if (c._id === 'email') stats.emails = c.count;
  });

  if (storage.length > 0) {
    stats.storageMb = Number((storage[0].totalBytes / (1024 * 1024)).toFixed(1));
  }

  // Count upcoming deadlines
  const now = new Date().toISOString().split('T')[0];
  const deadlinesCount = await Document.countDocuments({
    userId,
    dates: { $elemMatch: { $gte: now } }
  });
  
  stats.upcomingDeadlines = deadlinesCount;

  return stats;
};
