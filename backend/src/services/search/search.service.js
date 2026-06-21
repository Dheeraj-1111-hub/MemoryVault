const { searchDocuments } = require('./searchDocuments');
const SavedSearch = require('../../models/SavedSearch');
const Document = require('../../models/Document');

exports.executeSearch = async (userId, queryParams) => {
  return await searchDocuments({ ...queryParams, userId });
};

exports.getSuggestions = async (userId, q) => {
  if (!q) return [];
  const qLower = q.toLowerCase();
  
  // Find tags or companies that match the partial query
  const docs = await Document.find({
    userId,
    $or: [
      { tags: { $regex: new RegExp(qLower, 'i') } },
      { companies: { $regex: new RegExp(qLower, 'i') } },
      { documentType: { $regex: new RegExp(qLower, 'i') } }
    ]
  }).limit(20).lean();

  let suggestions = new Set();
  
  docs.forEach(doc => {
    if (doc.documentType && doc.documentType.toLowerCase().includes(qLower)) {
      suggestions.add(`Show ${doc.documentType} documents`);
    }
    doc.tags?.forEach(tag => {
      if (tag.toLowerCase().includes(qLower)) suggestions.add(`documents tagged #${tag}`);
    });
    doc.companies?.forEach(c => {
      if (c.toLowerCase().includes(qLower)) suggestions.add(`${c} documents`);
    });
  });

  return Array.from(suggestions).slice(0, 5);
};

exports.getRecentSearches = async (userId) => {
  const recent = await SavedSearch.find({ userId }).sort({ lastUsedAt: -1 }).limit(10).lean();
  return recent.map(r => r.query);
};

exports.saveSearch = async (userId, query) => {
  if (!query || !query.trim()) return;
  const qStr = query.trim().toLowerCase();
  
  const search = await SavedSearch.findOne({ userId, query: qStr });
  if (search) {
    search.useCount += 1;
    search.lastUsedAt = Date.now();
    await search.save();
  } else {
    await SavedSearch.create({ userId, query: qStr });
  }
};
