const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  fileType: {
    type: String, // 'pdf', 'image'
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    default: 'Uncategorized'
  },
  documentType: {
    type: String
  },
  kind: {
    type: String,
    enum: ['pdf', 'image', 'email'],
    default: 'pdf'
  },
  tags: [{
    type: String
  }],
  summary: {
    type: String
  },
  extractedText: {
    type: String
  },
  entities: [{ type: String }],
  dates: [{ type: String }],
  companies: [{ type: String }],
  salaries: [{ type: String }],
  metadata: {
    type: Object
  },
  aiProcessed: {
    type: Boolean,
    default: false
  },
  embedding: {
    type: [Number]
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  uploadDate: {
    type: Date,
    default: Date.now
  },
  isImportant: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Add Indexes for fast queries
documentSchema.index({ uploadDate: -1 });
documentSchema.index({ documentType: 1 });
documentSchema.index({ dates: 1 });
documentSchema.index({ tags: 1 });
documentSchema.index({ isImportant: 1 });
documentSchema.index({
  title: 'text',
  summary: 'text',
  extractedText: 'text',
  tags: 'text',
  companies: 'text'
}, {
  weights: {
    title: 10,
    companies: 5,
    tags: 5,
    summary: 3,
    extractedText: 1
  },
  name: 'document_text_index'
});

module.exports = mongoose.model('Document', documentSchema);
