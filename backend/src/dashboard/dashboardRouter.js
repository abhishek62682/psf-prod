import express from "express";
import { getDashboardSummary, getRecentDonors } from "./dashboardController.js";
import authenticate from "../middlewares/authenticate.js";

const dashboardRouter = express.Router();

dashboardRouter.use(authenticate);

// GET /api/dashboard
dashboardRouter.get("/", getDashboardSummary);

// GET /api/dashboard/recent-donors
dashboardRouter.get("/recent-donors", getRecentDonors);

export default dashboardRouter;
