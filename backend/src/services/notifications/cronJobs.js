const cron = require('node-cron');
const { triggerAllNotifiers } = require('./notification.service');

exports.initCronJobs = () => {
  console.log('[Cron] Initializing background jobs...');
  
  // For production, running once an hour is standard.
  // "0 * * * *" = every hour on the hour
  // For demo/MVP, we run it every 5 minutes to see it in action: "*/5 * * * *"
  cron.schedule('*/5 * * * *', async () => {
    try {
      await triggerAllNotifiers();
    } catch (error) {
      console.error('[Cron] Error running notifiers:', error);
    }
  });

  // Run immediately on startup
  triggerAllNotifiers().catch(console.error);
};
