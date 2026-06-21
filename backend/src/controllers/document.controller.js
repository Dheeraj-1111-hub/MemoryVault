const DocumentService = require('../services/document.service');
const path = require('path');

exports.uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const document = await DocumentService.createDocument(req.file, req.user.id);
    res.status(201).json({ success: true, document });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllDocuments = async (req, res) => {
  try {
    const documents = await DocumentService.getAllDocuments(req.query, req.user.id);
    
    // Transform to match frontend Doc format
    const formattedDocs = documents.map(doc => ({
      id: doc._id,
      title: doc.title,
      filename: doc.fileName,
      category: doc.category,
      documentType: doc.documentType,
      kind: doc.kind,
      uploadedAt: doc.uploadDate,
      tags: doc.tags,
      summary: doc.summary,
      excerpt: doc.extractedText,
      filePath: doc.filePath,
      important: doc.isImportant,
      status: doc.status,
      fields: doc.metadata,
      dates: doc.dates,
      companies: doc.companies,
      salaries: doc.salaries,
      entities: doc.entities
    }));

    res.status(200).json(formattedDocs);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getDocumentById = async (req, res) => {
  try {
    const doc = await DocumentService.getDocumentById(req.params.id, req.user.id);
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    const formattedDoc = {
      id: doc._id,
      title: doc.title,
      filename: doc.fileName,
      category: doc.category,
      documentType: doc.documentType,
      kind: doc.kind,
      uploadedAt: doc.uploadDate,
      tags: doc.tags,
      summary: doc.summary,
      excerpt: doc.extractedText,
      filePath: doc.filePath,
      important: doc.isImportant,
      status: doc.status,
      fields: doc.metadata,
      dates: doc.dates,
      companies: doc.companies,
      salaries: doc.salaries,
      entities: doc.entities
    };

    res.status(200).json(formattedDoc);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getDocumentStatus = async (req, res) => {
  try {
    const doc = await DocumentService.getDocumentById(req.params.id, req.user.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });
    
    res.status(200).json({ status: doc.status });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.reprocessDocument = async (req, res) => {
  try {
    const { processDocument } = require('../services/documentProcessor/processDocument');
    processDocument(req.params.id).catch(console.error);
    res.status(202).json({ success: true, message: 'Reprocessing started' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteDocument = async (req, res) => {
  try {
    const success = await DocumentService.deleteDocument(req.params.id, req.user.id);
    if (!success) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }
    res.status(200).json({ success: true, message: 'Document deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.downloadDocument = async (req, res) => {
  try {
    const doc = await DocumentService.getDocumentById(req.params.id, req.user.id);
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    const absolutePath = path.join(__dirname, '../../', doc.filePath);
    res.download(absolutePath, doc.originalName);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
