const mongoose = require('mongoose');

const timelineEventSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String },
  date: { type: Date, required: true },
  dateStr: { type: String }, // ISO string YYYY-MM-DD for easier querying
  sourceDocumentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document', required: true },
  category: { 
    type: String, 
    enum: ['Identity', 'Education', 'Finance', 'Bills', 'Placements', 'Jobs', 'Internships', 'Travel', 'Personal', 'Other'],
    default: 'Other'
  },
  priority: {
    type: String,
    enum: ['high', 'medium', 'low'],
    default: 'medium'
  },
  createdAt: { type: Date, default: Date.now }
});

timelineEventSchema.index({ date: 1 });
timelineEventSchema.index({ sourceDocumentId: 1 });
timelineEventSchema.index({ category: 1 });
timelineEventSchema.index({ priority: 1 });

module.exports = mongoose.model('TimelineEvent', timelineEventSchema);
