const Document = require('../../models/Document');

exports.retrieveDocuments = async (userId, question) => {
  // 1. Clean the question to create a keyword search string
  // Remove common stop words for better Mongo $text matching
  const stopWords = ['what', 'when', 'where', 'who', 'why', 'how', 'is', 'are', 'am', 'my', 'the', 'a', 'an', 'in', 'on', 'at', 'to', 'for', 'of', 'and', 'or', 'show', 'find', 'me'];
  const words = question.toLowerCase().replace(/[^\w\s]/gi, '').split(/\s+/);
  const keywords = words.filter(w => !stopWords.includes(w) && w.length > 1);
  
  const searchString = keywords.join(' ');

  let docs = [];

  if (searchString) {
    // 2. Perform MongoDB Text Search based on the index we created
    docs = await Document.find(
      { userId, $text: { $search: searchString } },
      { score: { $meta: "textScore" } }
    )
    .sort({ score: { $meta: "textScore" } })
    .limit(5)
    .lean();
  }

  // Fallback: If text search yields nothing, do a loose regex search on title and companies
  if (docs.length === 0 && keywords.length > 0) {
    const regexTerms = keywords.map(kw => new RegExp(kw, 'i'));
    docs = await Document.find({
      userId,
      $or: [
        { title: { $in: regexTerms } },
        { companies: { $in: regexTerms } },
        { tags: { $in: regexTerms } }
      ]
    }).limit(3).lean();
  }

  return docs;
};
