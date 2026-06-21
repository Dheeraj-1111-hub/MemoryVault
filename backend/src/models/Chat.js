const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  id: String,
  role: { type: String, enum: ['user', 'ai'] },
  text: String,
  sources: [{
    documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document' },
    title: String,
    kind: String
  }],
  confidence: Number,
  followUps: [String],
  createdAt: { type: Date, default: Date.now }
});

const chatSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  threadId: { type: String, required: true, unique: true },
  title: String,
  messages: [messageSchema],
  updatedAt: { type: Date, default: Date.now }
});

chatSchema.index({ threadId: 1 });
chatSchema.index({ updatedAt: -1 });

module.exports = mongoose.model('Chat', chatSchema);
