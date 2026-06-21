const mongoose = require('mongoose');

const savedSearchSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  query: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  lastUsedAt: { type: Date, default: Date.now },
  useCount: { type: Number, default: 1 }
});

module.exports = mongoose.model('SavedSearch', savedSearchSchema);
