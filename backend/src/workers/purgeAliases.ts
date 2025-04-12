import { CronJob } from "cron"; // Use ES Modules imports
import URL from "../models/urlModel"; // Assuming you're using ESModules, otherwise use require

export default () => {
  // Set up a cron job to run every day at midnight (00:00)
  const job = new CronJob(
    "0 0 * * *",
    async () => {
      try {
        // Find expired URLs
        const expiredUrls = await URL.find({
          ExpirationDate: { $lt: Date.now() },
        });

        if (expiredUrls.length > 0) {
          // Delete expired URLs in bulk
          const idsToDelete = expiredUrls.map((url) => url._id);
          const result = await URL.deleteMany({ _id: { $in: idsToDelete } });

          console.log(`Deleted ${result.deletedCount} expired URLs`);
        } else {
          console.log("No expired URLs found");
        }
      } catch (err) {
        console.error("Error cleaning expired URLs:", err);
      }
    },
    null,
    true
  );

  // Start the job
  job.start();
};
