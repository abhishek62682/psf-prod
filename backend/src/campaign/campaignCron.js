import cron from "node-cron";
import { autoCompleteCampaigns } from "./campaignController.js";

// Daily at 12:00 AM — safety net for campaigns whose end date passes
// without a triggering donation (goal-reached is handled immediately in
// donationController.verifyDonation instead).
const startCampaignCronJobs = () => {
  cron.schedule("0 0 * * *", async () => {
    try {
      const result = await autoCompleteCampaigns();
      console.log(
        `[campaign-cron] Auto-completed ${result.modifiedCount} campaign(s) at ${new Date().toISOString()}.`
      );
    } catch (err) {
      console.error("[campaign-cron] Failed to auto-complete campaigns:", err);
    }
  });
};

export default startCampaignCronJobs;
