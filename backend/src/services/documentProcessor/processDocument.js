const Document = require('../../models/Document');
const { extractTextFromPDF, extractTextFromImage } = require('./extractText');
const { analyzeDocument } = require('./groq.service');
const semanticSearch = require('../search/semanticSearch');

exports.processDocument = async (documentId) => {
  try {
    const doc = await Document.findById(documentId);
    if (!doc) throw new Error('Document not found');

    const User = require('../../models/User');
    const user = await User.findById(doc.userId);
    const settings = user?.settings || {
      model: 'Groq • llama-3.3-70b',
      temperature: 0.3,
      autoTagUploads: true,
      extractDates: true
    };

    // Set status to processing
    doc.status = 'processing';
    await doc.save();

    // 1. Extract Text
    let rawText = '';
    if (doc.kind === 'pdf') {
      rawText = await extractTextFromPDF(doc.filePath);
    } else if (doc.kind === 'image') {
      rawText = await extractTextFromImage(doc.filePath);
    } else {
      rawText = 'Unsupported document type for extraction.';
    }

    // Sanitize text to remove problematic unicode bullets that confuse JSON models
    const sanitizedText = rawText.replace(/[^\x20-\x7E\n]/g, " ").substring(0, 5000);
    
    // Update document with raw text
    doc.extractedText = sanitizedText; 

    // 2. Groq Intelligence
    const aiData = await analyzeDocument(sanitizedText, settings);

    // 3. Update Document
    doc.summary = aiData.summary;
    doc.documentType = aiData.documentType;
    doc.category = aiData.documentType; // Keep them synced for Phase 1 filters
    
    // Apply Settings: Auto-tag
    doc.tags = settings.autoTagUploads ? (aiData.tags || []) : [];
    
    doc.dates = aiData.dates || [];
    doc.companies = aiData.companies || [];
    doc.salaries = aiData.salaries || [];
    doc.entities = aiData.importantEntities || [];
    doc.isImportant = aiData.isImportant || false;
    doc.metadata = aiData.metadata || {};

    // 4. Generate Semantic Embedding
    let embeddingText = `${doc.title || ''} ${doc.summary || ''} ${doc.tags.join(' ')}`;
    if (embeddingText.length < 50 && rawText) {
      embeddingText += ' ' + rawText.substring(0, 500);
    }
    doc.embedding = await semanticSearch.generateEmbedding(embeddingText);
    
    // 5. Timeline Events
    const TimelineEvent = require('../../models/TimelineEvent');
    // Clear old events if this is a re-process
    await TimelineEvent.deleteMany({ sourceDocumentId: doc._id });
    
    // Apply Settings: Extract dates
    if (settings.extractDates && aiData.timelineEvents && Array.isArray(aiData.timelineEvents)) {
      const validCategories = ['Identity', 'Education', 'Finance', 'Bills', 'Placements', 'Jobs', 'Internships', 'Travel', 'Personal', 'Other'];
      
      const eventsToSave = aiData.timelineEvents
        .filter(e => {
          if (!e.title || !e.date) return false;
          const d = new Date(e.date);
          return !isNaN(d.getTime()); // Valid date only
        })
        .map(e => ({
          title: e.title,
          description: doc.title,
          date: new Date(e.date),
          dateStr: e.date,
          sourceDocumentId: doc._id,
          userId: doc.userId,
          category: validCategories.includes(e.category) ? e.category : 'Other',
          priority: ['high', 'medium', 'low'].includes(e.priority) ? e.priority : 'medium'
        }));
        
      if (eventsToSave.length > 0) {
        await TimelineEvent.insertMany(eventsToSave);
      }
    }
    
    doc.aiProcessed = true;
    doc.status = 'completed';

    await doc.save();
    console.log(`[AI Engine] Document ${documentId} processed successfully.`);

  } catch (error) {
    console.error(`[AI Engine] Error processing document ${documentId}:`, error);
    try {
      await Document.findByIdAndUpdate(documentId, { status: 'failed' });
    } catch (e) {}
  }
};
