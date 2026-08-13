import { z } from "zod";
import { objectId } from "../middlewares/validate.js";
import { CAREER_EMPLOYMENT_TYPES, CAREER_WORK_MODES, CAREER_STATUSES } from "./careerConstants.js";

const careerBody = z.object({
  title: z.string({ message: "Title is required." }).trim().min(1, { message: "Title is required." }),
  employmentType: z.enum(CAREER_EMPLOYMENT_TYPES, { message: "Invalid employment type." }),
  workMode: z.enum(CAREER_WORK_MODES, { message: "Invalid work mode." }),
  location: z.string({ message: "Location is required." }).trim().min(1, { message: "Location is required." }),
  description: z
    .string({ message: "Description is required." })
    .trim()
    .min(1, { message: "Description is required." }),
  experience: z
    .string({ message: "Experience is required." })
    .trim()
    .min(1, { message: "Experience is required." }),
  qualification: z
    .string({ message: "Qualification is required." })
    .trim()
    .min(1, { message: "Qualification is required." }),
  status: z.enum(CAREER_STATUSES, { message: "Invalid status." }).optional(),
});

export const createCareerSchema = z.object({ body: careerBody });

export const updateCareerSchema = z.object({
  params: z.object({ id: objectId }),
  body: careerBody.partial(),
});

export const careerIdSchema = z.object({
  params: z.object({ id: objectId }),
});
