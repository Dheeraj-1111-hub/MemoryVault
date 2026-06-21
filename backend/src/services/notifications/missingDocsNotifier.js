const { analyzeIdentity } = require('../important/identity.service');
const Notification = require('../../models/Notification');

exports.checkMissingDocs = async (userId) => {
  const identityData = await analyzeIdentity(userId);
  
  if (identityData.missing && identityData.missing.length > 0) {
    const importantMissing = identityData.missing.filter(m => m.includes('Aadhaar') || m.includes('PAN') || m.includes('Passport'));
    
    if (importantMissing.length > 0) {
      const monthYear = new Date().toISOString().substring(0, 7); // Remind once a month
      const referenceId = `missing_docs_${monthYear}`;
      
      try {
        await Notification.updateOne(
          { referenceId },
          {
            $setOnInsert: {
              userId,
              title: 'Missing Identity Documents',
              message: `You haven't uploaded your ${importantMissing.join(', ')} yet.`,
              type: 'missing',
              priority: 'medium',
              actionLink: '/important'
            }
          },
          { upsert: true }
        );
      } catch (e) {}
    }
  }
};
