const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['deadline', 'expiry', 'missing', 'stale', 'insight', 'digest'],
    required: true
  },
  priority: {
    type: String,
    enum: ['high', 'medium', 'low'],
    default: 'medium'
  },
  isRead: { type: Boolean, default: false },
  actionLink: { type: String }, // e.g. /timeline, /important, /vault#id
  referenceId: { type: String, unique: true, sparse: true }, // To prevent duplicates (e.g. 'resume_stale_2026-06')
  createdAt: { type: Date, default: Date.now }
});

notificationSchema.index({ isRead: 1 });
notificationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
