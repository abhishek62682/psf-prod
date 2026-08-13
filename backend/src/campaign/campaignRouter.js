import express from "express";
import {
  createCampaign,
  listCampaigns,
  adminListCampaigns,
  getCampaignOptions,
  getCampaignById,
  getCampaignDonations,
  updateCampaign,
  deleteCampaign,
} from "./campaignController.js";
import {
  createCampaignSchema,
  updateCampaignSchema,
  campaignIdSchema,
} from "./campaignValidation.js";
import authenticate from "../middlewares/authenticate.js";
import validate from "../middlewares/validate.js";

const campaignRouter = express.Router();

// "/admin" and "/options" must come before "/:id" — otherwise they'd match
// as an :id and hit the public getCampaignById handler instead.
campaignRouter.get("/admin", authenticate, adminListCampaigns);
campaignRouter.get("/options", getCampaignOptions);

// ----- Public -----
campaignRouter.get("/", listCampaigns);
campaignRouter.get("/:id", validate(campaignIdSchema), getCampaignById);
campaignRouter.get("/:id/donations", validate(campaignIdSchema), getCampaignDonations);

// ----- Admin -----
campaignRouter.post("/", authenticate, validate(createCampaignSchema), createCampaign);
campaignRouter.patch("/:id", authenticate, validate(updateCampaignSchema), updateCampaign);
campaignRouter.delete("/:id", authenticate, validate(campaignIdSchema), deleteCampaign);

export default campaignRouter;
