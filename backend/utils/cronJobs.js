const cron = require('node-cron');
const Order = require('../models/Order'); // Adjust path if needed

/**
 * HOURLY JOB: Marks abandoned draft orders as 'cancelled'.
 * This job finds any order that is still in 'pending_payment' status one hour
 * after it was created and updates its status to 'cancelled'. This safely
 * invalidates drafts without touching recent ones or finalized orders (like COD).
 */
const markAbandonedDrafts = () => {
  // Schedule to run at the beginning of every hour.
  cron.schedule('0 * * * *', async () => {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    console.log(`[CRON] Running job: Mark abandoned drafts older than ${oneHourAgo.toLocaleTimeString()}`);

    try {
      const result = await Order.updateMany(
        {
          orderStatus: 'pending_payment',
          createdAt: { $lt: oneHourAgo } // Find drafts created more than an hour ago
        },
        {
          $set: {
            orderStatus: 'cancelled',
            cancelledAt: new Date(),
            cancellationReason: 'Abandoned in cart'
          }
        }
      );

      if (result.modifiedCount > 0) {
        console.log(`[CRON] Marked ${result.modifiedCount} abandoned draft orders as cancelled.`);
      } else {
        console.log('[CRON] No abandoned drafts to mark.');
      }
    } catch (error) {
      console.error('[CRON] Error marking abandoned drafts:', error);
    }
  });
};


/**
 * DAILY JOB: Deletes invalidated draft orders.
 * This job runs once a day (at midnight) to permanently delete documents that are
 * truly junk drafts. It only targets documents that were previously marked as 'cancelled'
 * AND were never paid, ensuring no important order history is ever removed.
 */
const deleteCancelledDrafts = () => {
    // Schedule to run once a day at midnight.
    cron.schedule('0 0 * * *', async () => {
        console.log('[CRON] Running daily job: Deleting invalidated draft orders.');

        try {
            const result = await Order.deleteMany({
                orderStatus: 'cancelled',
                paymentStatus: 'pending', // IMPORTANT: Only deletes drafts that were never finalized
                paymentMethod: 'pending'
            });

            if (result.deletedCount > 0) {
                console.log(`[CRON] Permanently deleted ${result.deletedCount} invalidated draft orders.`);
            } else {
                console.log('[CRON] No invalidated drafts to delete.');
            }
        } catch (error) {
            console.error('[CRON] Error deleting cancelled drafts:', error);
        }
    });
};


// Export a function to start all scheduled jobs
const startCronJobs = () => {
  markAbandonedDrafts();
  deleteCancelledDrafts();
  console.log('Scheduled jobs for draft order cleanup have been started.');
};

module.exports = { startCronJobs };
