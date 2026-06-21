const Document = require('../../models/Document');

exports.analyzeFinance = async (userId) => {
  const docs = await Document.find({
    userId,
    $or: [
      { documentType: { $regex: /finance|bill|invoice|receipt|statement|tax/i } },
      { tags: { $regex: /finance|bill|invoice|receipt|statement|tax/i } },
      { title: { $regex: /bill|invoice|receipt|statement|tax/i } }
    ]
  }).lean();

  const status = {
    bills: 0,
    statements: 0,
    tax: 0
  };

  const docsFound = [];

  docs.forEach(d => {
    const hay = `${d.title} ${d.documentType} ${(d.tags || []).join(' ')}`.toLowerCase();
    
    if (hay.includes('bill') || hay.includes('invoice') || hay.includes('receipt')) status.bills++;
    if (hay.includes('statement') || hay.includes('bank')) status.statements++;
    if (hay.includes('tax') || hay.includes('itr')) status.tax++;
    
    docsFound.push({ id: d._id, title: d.title, kind: d.kind, summary: d.summary, _id: d._id, category: d.documentType, tags: d.tags });
  });

  // Finance health is arbitrary without knowing exactly what they need.
  // We can say: 1 bank statement + 1 tax doc + 1 bill = 100%
  let healthPoints = 0;
  if (status.bills > 0) healthPoints += 33;
  if (status.statements > 0) healthPoints += 33;
  if (status.tax > 0) healthPoints += 34;
  
  // If no finance docs at all, health is 0
  const health = docs.length === 0 ? 0 : healthPoints === 0 ? 20 : healthPoints;

  const missing = [];
  if (status.statements === 0) missing.push('Bank Statement');
  if (status.tax === 0) missing.push('Tax Document (ITR/Form 16)');

  return { health, status, missing, docs: docsFound };
};
