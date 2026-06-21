const Document = require('../../models/Document');

exports.getSuggestions = async (userId) => {
  const suggestions = [
    "Show upcoming deadlines",
    "Find my latest identity documents",
    "Show recent placement notices"
  ];

  // Try to find a company to generate a dynamic query
  const docWithCompany = await Document.findOne({ userId, companies: { $exists: true, $ne: [] } }).lean();
  if (docWithCompany && docWithCompany.companies.length > 0) {
    suggestions.unshift(`When is my ${docWithCompany.companies[0]} interview?`);
  }

  // Try to find a specific tag
  const docWithTag = await Document.findOne({ tags: { $exists: true, $ne: [] } }).lean();
  if (docWithTag && docWithTag.tags.length > 0) {
    suggestions.unshift(`Show documents tagged with #${docWithTag.tags[0]}`);
  }

  // Return max 5
  return [...new Set(suggestions)].slice(0, 5);
};
