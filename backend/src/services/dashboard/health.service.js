const Document = require('../../models/Document');

exports.getHealthScore = async (userId) => {
  const docs = await Document.find({ userId }).select('category').lean();

  const counts = {
    identity: 0,
    education: 0,
    finance: 0,
    placements: 0
  };

  docs.forEach(d => {
    const c = (d.category || '').toLowerCase();
    if (c === 'identity') counts.identity++;
    else if (c === 'education') counts.education++;
    else if (c === 'finance' || c === 'bill') counts.finance++;
    else if (c === 'placement notice' || c === 'offer letter' || c === 'resume' || c === 'jobs') counts.placements++;
  });

  // Identity: 2+ docs = 100%
  const identityScore = Math.min(Math.round((counts.identity / 2) * 100), 100);
  // Education: 2+ docs = 100%
  const educationScore = Math.min(Math.round((counts.education / 2) * 100), 100);
  // Finance: 1+ docs = 100%
  const financeScore = Math.min(Math.round((counts.finance / 1) * 100), 100);
  // Placements: 1+ docs = 100%
  const placementsScore = Math.min(Math.round((counts.placements / 1) * 100), 100);

  const overall = Math.round((identityScore + educationScore + financeScore + placementsScore) / 4);

  return {
    overall,
    breakdown: {
      identity: identityScore,
      education: educationScore,
      finance: financeScore,
      placements: placementsScore
    }
  };
};
