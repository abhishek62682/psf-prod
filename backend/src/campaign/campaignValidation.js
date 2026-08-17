import { z } from "zod";
import { objectId } from "../middlewares/validate.js";
import { CAMPAIGN_STATUSES, CAMPAIGN_MAX_DOCUMENTS } from "./campaignConstants.js";

const campaignBody = z.object({
  title: z.string({ message: "Title is required." }).trim().min(1, { message: "Title is required." }),
  slug: z.string().trim().optional(),
  shortDescription: z
    .string({ message: "Short description is required." })
    .trim()
    .min(1, { message: "Short description is required." })
    .max(300, { message: "Short description must be at most 300 characters." }),
  description: z
    .string({ message: "Description is required." })
    .min(1, { message: "Description is required." }),
  goalAmount: z.coerce
    .number({ message: "Goal amount must be a number." })
    .positive({ message: "Goal amount must be a positive number." }),
  coverImage: z.string().optional(),
  gallery: z.array(z.string()).optional(),
  documents: z
    .array(
      z.object({
        url: z.string().trim().min(1, { message: "Document url is required." }),
        label: z.string().trim().min(1, { message: "Document label is required." }),
      })
    )
    .max(CAMPAIGN_MAX_DOCUMENTS, { message: `Upload at most ${CAMPAIGN_MAX_DOCUMENTS} PDF files.` })
    .optional(),
  startDate: z.coerce.date({ message: "Start date must be a valid date." }),
  endDate: z.coerce.date({ message: "End date must be a valid date." }),
  isFeatured: z.coerce.boolean().optional(),
  status: z.enum(CAMPAIGN_STATUSES, { message: "Invalid status." }).optional(),
  paymentReceivingAccountId: objectId.optional(),
});

export const createCampaignSchema = z.object({
  body: campaignBody.refine((data) => data.endDate > data.startDate, {
    message: "End date must be after start date.",
    path: ["endDate"],
  }),
});

export const updateCampaignSchema = z.object({
  params: z.object({ id: objectId }),
  body: campaignBody.partial(),
});

export const campaignIdSchema = z.object({
  params: z.object({ id: objectId }),
});
