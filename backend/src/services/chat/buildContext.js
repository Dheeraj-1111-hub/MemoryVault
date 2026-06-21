exports.buildContext = (documents) => {
  if (!documents || documents.length === 0) return "No context documents provided.";

  let contextString = "Here are the relevant documents from the user's vault:\n\n";

  documents.forEach((doc, index) => {
    contextString += `--- Document [${index + 1}] ---\n`;
    contextString += `ID: ${doc._id}\n`;
    contextString += `Title: ${doc.title}\n`;
    contextString += `Type: ${doc.documentType || doc.category}\n`;
    
    if (doc.summary) contextString += `Summary: ${doc.summary}\n`;
    if (doc.dates && doc.dates.length > 0) contextString += `Important Dates: ${doc.dates.join(', ')}\n`;
    if (doc.salaries && doc.salaries.length > 0) contextString += `Salaries/CTC: ${doc.salaries.join(', ')}\n`;
    if (doc.companies && doc.companies.length > 0) contextString += `Companies: ${doc.companies.join(', ')}\n`;
    
    // Include specific metadata
    if (doc.metadata && Object.keys(doc.metadata).length > 0) {
      contextString += `Extracted Data:\n`;
      Object.entries(doc.metadata).forEach(([k, v]) => {
        contextString += `  - ${k}: ${v}\n`;
      });
    }

    // Include raw text excerpt just in case the AI needs deeper context
    if (doc.extractedText) {
      contextString += `Excerpt: ${doc.extractedText.substring(0, 1000)}...\n`;
    }
    
    contextString += `\n`;
  });

  return contextString;
};
