const express = require('express');
const router = express.Router();
const documentController = require('../controllers/document.controller');
const upload = require('../middleware/upload.middleware');

// POST /api/documents/upload
router.post('/upload', upload.single('file'), documentController.uploadDocument);

// GET /api/documents
router.get('/', documentController.getAllDocuments);

// GET /api/documents/:id
router.get('/:id', documentController.getDocumentById);

// GET /api/documents/:id/status
router.get('/:id/status', documentController.getDocumentStatus);

// POST /api/documents/:id/reprocess
router.post('/:id/reprocess', documentController.reprocessDocument);

// DELETE /api/documents/:id
router.delete('/:id', documentController.deleteDocument);

// GET /api/documents/:id/download
router.get('/:id/download', documentController.downloadDocument);

module.exports = router;
