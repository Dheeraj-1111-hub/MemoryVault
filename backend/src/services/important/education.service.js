const Document = require('../../models/Document');

exports.analyzeEducation = async (userId) => {
  const docs = await Document.find({
    userId,
    $or: [
      { documentType: { $regex: /education|degree|marksheet|certificate|transcript/i } },
      { tags: { $regex: /education|degree|marksheet|certificate|transcript/i } },
      { title: { $regex: /degree|marksheet|certificate|transcript/i } }
    ]
  }).lean();

  const status = {
    degree: false,
    marksheet: false,
    certificate: false
  };

  const docsFound = [];

  docs.forEach(d => {
    const hay = `${d.title} ${d.documentType} ${(d.tags || []).join(' ')}`.toLowerCase();
    let matched = false;

    if (hay.includes('degree') || hay.includes('diploma')) { status.degree = true; matched = true; }
    if (hay.includes('mark') || hay.includes('transcript') || hay.includes('grade')) { status.marksheet = true; matched = true; }
    if (hay.includes('certificat')) { status.certificate = true; matched = true; }
    
    if (matched || hay.includes('education')) {
      docsFound.push({ id: d._id, title: d.title, kind: d.kind, summary: d.summary, _id: d._id, category: d.documentType, tags: d.tags });
    }
  });

  const total = 3;
  const foundCount = Object.values(status).filter(Boolean).length;
  // If they just started college they might not have a degree. Scale health accordingly, 
  // but for completeness we just show mathematical % of standard expected docs.
  const health = Math.round((foundCount / total) * 100);

  const missing = [];
  if (!status.degree) missing.push('Degree / Diploma');
  if (!status.marksheet) missing.push('Latest Marksheet');

  return { health, status, missing, docs: docsFound };
};
