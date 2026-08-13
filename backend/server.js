import app from "./src/app.js";
import { config } from "./src/config/config.js";
import connectDB from "./src/config/db.js";
import startCampaignCronJobs from "./src/campaign/campaignCron.js";

const startServer = async () => {
  await connectDB();

  startCampaignCronJobs();

  const port = config.port || 3000;

  app.listen(port, () => {
    console.log(`Listening on port: ${port}`);
  });
};

startServer();
