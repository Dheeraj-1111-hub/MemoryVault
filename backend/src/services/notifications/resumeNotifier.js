const { analyzePlacement } = require('../important/placement.service');
const Notification = require('../../models/Notification');

exports.checkResumeHealth = async (userId) => {
  const placementData = await analyzePlacement(userId);
  
  if (placementData.alerts && placementData.alerts.length > 0) {
    for (const alert of placementData.alerts) {
      if (alert.includes('Resume not updated')) {
        const monthYear = new Date().toISOString().substring(0, 7); // e.g. "2026-06"
        const referenceId = `stale_resume_${monthYear}`;
        
        try {
          await Notification.updateOne(
            { referenceId },
            {
              $setOnInsert: {
                userId,
                title: 'Resume Needs Update',
                message: alert,
                type: 'stale',
                priority: 'medium',
                actionLink: '/important'
              }
            },
            { upsert: true }
          );
        } catch (e) {}
      }
    }
  }
};
