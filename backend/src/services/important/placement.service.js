const Document = require('../../models/Document');

exports.analyzePlacement = async (userId) => {
  const docs = await Document.find({
    userId,
    $or: [
      { documentType: { $regex: /resume|cv|offer|internship|placement|notice/i } },
      { tags: { $regex: /resume|cv|offer|internship|placement|notice/i } },
      { title: { $regex: /resume|cv|offer|internship|placement|notice/i } }
    ]
  }).lean();

  const status = {
    resumeExists: false,
    resumeRecent: false,
    certificates: false,
    internships: false,
    notices: false
  };

  const docsFound = [];
  let resumeDate = null;

  docs.forEach(d => {
    const hay = `${d.title} ${d.documentType} ${(d.tags || []).join(' ')}`.toLowerCase();
    let matched = false;

    if (hay.includes('resume') || hay.includes('cv')) { 
      status.resumeExists = true; 
      matched = true;
      if (!resumeDate || new Date(d.uploadDate) > resumeDate) {
        resumeDate = new Date(d.uploadDate);
      }
    }
    if (hay.includes('certificat')) { status.certificates = true; matched = true; }
    if (hay.includes('intern') || hay.includes('offer')) { status.internships = true; matched = true; }
    if (hay.includes('placement') || hay.includes('notice')) { status.notices = true; matched = true; }
    
    if (matched) {
      docsFound.push({ id: d._id, title: d.title, kind: d.kind, summary: d.summary, _id: d._id, category: d.documentType, tags: d.tags });
    }
  });

  // Check if resume is recent (< 6 months)
  let resumeStaleMonths = 0;
  if (resumeDate) {
    const months = (new Date() - resumeDate) / (1000 * 60 * 60 * 24 * 30);
    resumeStaleMonths = Math.floor(months);
    if (months < 6) {
      status.resumeRecent = true;
    }
  }

  let health = 0;
  if (status.resumeExists) health += 20;
  if (status.resumeRecent) health += 20;
  if (status.certificates) health += 20;
  if (status.internships) health += 20;
  if (status.notices) health += 20;

  const missing = [];
  if (!status.resumeExists) missing.push('Resume');
  
  const alerts = [];
  if (status.resumeExists && !status.resumeRecent) {
    alerts.push(`Resume not updated in ${resumeStaleMonths} months`);
  }

  return { health, status, missing, alerts, docs: docsFound };
};
