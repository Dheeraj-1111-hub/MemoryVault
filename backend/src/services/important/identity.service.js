const Document = require('../../models/Document');

exports.analyzeIdentity = async (userId) => {
  // Find all identity-related documents
  const docs = await Document.find({
    userId,
    $or: [
      { documentType: { $regex: /identity|pan|aadhaar|passport|license|voter/i } },
      { tags: { $regex: /pan|aadhaar|passport|license|identity|voter/i } },
      { title: { $regex: /pan|aadhaar|passport|license|voter/i } }
    ]
  }).lean();

  const status = {
    pan: false,
    aadhaar: false,
    passport: false,
    license: false,
    voter: false
  };

  const docsFound = [];

  docs.forEach(d => {
    const hay = `${d.title} ${d.documentType} ${(d.tags || []).join(' ')}`.toLowerCase();
    let matched = false;

    if (hay.includes('pan')) { status.pan = true; matched = true; }
    if (hay.includes('aadhaar') || hay.includes('adhar')) { status.aadhaar = true; matched = true; }
    if (hay.includes('passport')) { status.passport = true; matched = true; }
    if (hay.includes('license') || hay.includes('driving')) { status.license = true; matched = true; }
    if (hay.includes('voter')) { status.voter = true; matched = true; }
    
    if (matched || hay.includes('identity')) {
      docsFound.push({ id: d._id, title: d.title, kind: d.kind, summary: d.summary, _id: d._id, category: d.documentType, tags: d.tags });
    }
  });

  const total = 5;
  const foundCount = Object.values(status).filter(Boolean).length;
  const health = Math.round((foundCount / total) * 100);

  const missing = [];
  if (!status.pan) missing.push('PAN Card');
  if (!status.aadhaar) missing.push('Aadhaar Card');
  if (!status.passport) missing.push('Passport');
  if (!status.license) missing.push('Driving License');
  if (!status.voter) missing.push('Voter ID');

  return { health, status, missing, docs: docsFound };
};
