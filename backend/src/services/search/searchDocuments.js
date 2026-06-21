const Document = require('../../models/Document');
const semanticSearch = require('./semanticSearch');
const { rankDocuments } = require('./rankingEngine');

exports.searchDocuments = async (queryParams) => {
  const { userId, q, type, tags, minAmount } = queryParams;
  
  // 1. Build Exact Filters
  const matchFilter = { userId };
  
  if (type && type !== 'All') {
    matchFilter.kind = type;
  }
  
  if (tags) {
    const tagsArray = Array.isArray(tags) ? tags : [tags];
    matchFilter.tags = { $all: tagsArray };
  }

  // 2. Fetch baseline documents using Mongoose Filters + $text if query exists
  let docs = [];
  
  if (q && q.trim()) {
    // If we have a text query, we try to get $text matches first, 
    // OR we just get all docs that match the exact filters and rely on our Ranking Engine.
    // Since our DB might be small, let's fetch docs matching filters and rank them in memory for semantic MVP.
    // To scale, we would do a $text match combined with Vector Search.
    
    const dbFilter = { ...matchFilter };
    
    docs = await Document.find(dbFilter).lean();
    
    // Generate embedding for user query
    const queryEmbedding = await semanticSearch.generateEmbedding(q);
    
    // Pass to ranking engine
    docs = rankDocuments(docs, q, queryEmbedding, semanticSearch);
    
  } else {
    // No query, just filters
    docs = await Document.find(matchFilter).sort({ uploadDate: -1 }).lean();
  }

  // 3. Post-filter for complex logic like `minAmount`
  if (minAmount) {
    const minAmtNum = Number(minAmount);
    docs = docs.filter(doc => {
      // Check salaries array or metadata amount
      const hasSalary = doc.salaries && doc.salaries.some(s => {
        const num = Number(s.replace(/[^0-9.-]+/g, ""));
        return num >= minAmtNum;
      });
      const hasAmount = doc.metadata && doc.metadata.amount && Number(doc.metadata.amount.replace(/[^0-9.-]+/g, "")) >= minAmtNum;
      return hasSalary || hasAmount;
    });
  }

  return docs;
};
