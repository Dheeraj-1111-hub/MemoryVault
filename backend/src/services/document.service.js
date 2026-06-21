const Document = require('../models/Document');
const path = require('path');
const fs = require('fs');
const { processDocument } = require('./documentProcessor/processDocument');

class DocumentService {
  
  static guessCategory(name) {
    const n = name.toLowerCase();
    if (/(pan|aadhaar|passport|license)/.test(n)) return "Identity";
    if (/(offer|appointment)/.test(n)) return "Offer Letter";
    if (/(bill|invoice|electric)/.test(n)) return "Bill";
    if (/(screenshot|ss|otp)/.test(n)) return "Screenshot";
    if (/(cert|certificate)/.test(n)) return "Certificate";
    if (/(eml|mail)/.test(n)) return "Email";
    if (/(notice|placement)/.test(n)) return "Placement Notice";
    if (/(marksheet|degree|transcript)/.test(n)) return "Education";
    return "Uncategorized";
  }

  static async createDocument(fileData, userId) {
    const kind = fileData.mimetype === 'application/pdf' ? 'pdf' : 'image';
    const title = fileData.originalname.replace(/\.[^.]+$/, "").replace(/[_-]/g, " ");
    const category = this.guessCategory(title);

    const newDoc = new Document({
      userId,
      title,
      originalName: fileData.originalname,
      fileName: fileData.filename,
      filePath: `/uploads/${kind}s/${fileData.filename}`,
      fileType: path.extname(fileData.originalname).replace('.', '').toLowerCase(),
      mimeType: fileData.mimetype,
      fileSize: fileData.size,
      category,
      kind,
      status: 'pending'
    });

    const savedDoc = await newDoc.save();
    
    // Update User storage
    const User = require('../models/User');
    await User.findByIdAndUpdate(userId, { $inc: { storageUsed: fileData.size } });
    
    // Fire background worker asynchronously
    processDocument(savedDoc._id).catch(console.error);

    return savedDoc;
  }

  static async getAllDocuments(query, userId) {
    let filter = { userId };
    if (query.type && query.type !== 'All') {
      filter.category = query.type;
    }
    if (query.search) {
      filter.title = { $regex: query.search, $options: 'i' };
    }
    
    // Sort by newest first
    return await Document.find(filter).sort({ uploadDate: -1 });
  }

  static async getDocumentById(id, userId) {
    return await Document.findOne({ _id: id, userId });
  }

  static async deleteDocument(id, userId) {
    const doc = await Document.findOne({ _id: id, userId });
    if (!doc) return null;

    // Delete physical file
    const absolutePath = path.join(__dirname, '../../', doc.filePath);
    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
    }

    // Update User storage
    const User = require('../models/User');
    await User.findByIdAndUpdate(userId, { $inc: { storageUsed: -doc.fileSize } });

    await Document.findByIdAndDelete(id);
    return true;
  }
}

module.exports = DocumentService;
