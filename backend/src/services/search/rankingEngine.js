exports.rankDocuments = (documents, query, queryEmbedding, semanticSearchInstance) => {
  if (!query) return documents;
  
  const queryLower = query.toLowerCase();
  const queryWords = queryLower.split(/\W+/).filter(w => w.length > 2); // Split into words

  return documents.map(doc => {
    let score = doc.textScore || 0; // Base score from MongoDB text search if available

    // Exact Match Bonus (Whole Query)
    if (doc.title && doc.title.toLowerCase().includes(queryLower)) score += 10;
    if (doc.tags && doc.tags.some(t => t.toLowerCase() === queryLower)) score += 8;
    if (doc.companies && doc.companies.some(c => c.toLowerCase() === queryLower)) score += 8;
    if (doc.documentType && doc.documentType.toLowerCase().includes(queryLower)) score += 6;
    if (doc.summary && doc.summary.toLowerCase().includes(queryLower)) score += 3;

    // Word-by-word Match Bonus
    queryWords.forEach(word => {
      if (doc.title && doc.title.toLowerCase().includes(word)) score += 5;
      if (doc.tags && doc.tags.some(t => t.toLowerCase() === word)) score += 4;
      if (doc.companies && doc.companies.some(c => c.toLowerCase() === word)) score += 4;
      if (doc.documentType && doc.documentType.toLowerCase().includes(word)) score += 4;
      if (doc.summary && doc.summary.toLowerCase().includes(word)) score += 2;
      if (doc.extractedText && doc.extractedText.toLowerCase().includes(word)) score += 1;
    });

    // Semantic Similarity Bonus
    let semanticScore = 0;
    if (queryEmbedding && queryEmbedding.length > 0 && doc.embedding && doc.embedding.length > 0) {
      semanticScore = semanticSearchInstance.cosineSimilarity(queryEmbedding, doc.embedding);
      // Lower threshold to 0.15 to capture broader semantic matches
      if (semanticScore > 0.15) {
        score += (semanticScore * 20); // Boost semantic importance
      }
    }

    doc.finalScore = score;
    doc.semanticScore = semanticScore;

    return doc;
  })
  .filter(doc => doc.finalScore > 0) // Filter out pure garbage
  .sort((a, b) => b.finalScore - a.finalScore); // Sort descending
};

