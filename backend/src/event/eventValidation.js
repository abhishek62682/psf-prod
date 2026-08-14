import { z } from "zod";
import { objectId } from "../middlewares/validate.js";
import { EVENT_MIN_IMAGES, EVENT_MAX_IMAGES, EVENT_STATUSES } from "./eventConstants.js";

const eventBody = z.object({
  title: z.string({ message: "Title is required." }).trim().min(1, { message: "Title is required." }),
  category: z
    .string({ message: "Category is required." })
    .trim()
    .min(1, { message: "Category is required." }),
  description: z
    .string({ message: "Description is required." })
    .trim()
    .min(1, { message: "Description is required." }),
  images: z
    .array(z.string())
    .min(EVENT_MIN_IMAGES, { message: `Upload at least ${EVENT_MIN_IMAGES} photo.` })
    .max(EVENT_MAX_IMAGES, { message: `Upload at most ${EVENT_MAX_IMAGES} photos.` }),
  stats: z
    .array(
      z.object({
        value: z.string().trim().min(1, { message: "Stat value is required." }),
        label: z.string().trim().min(1, { message: "Stat label is required." }),
      })
    )
    .optional(),
  activities: z
    .array(
      z.object({
        title: z.string().trim().min(1, { message: "Activity title is required." }),
        description: z.string().trim().min(1, { message: "Activity description is required." }),
      })
    )
    .optional(),
  eventDate: z.coerce.date({ message: "Event date must be a valid date." }).optional(),
  status: z.enum(EVENT_STATUSES, { message: "Invalid status." }).optional(),
});

export const createEventSchema = z.object({ body: eventBody });

export const updateEventSchema = z.object({
  params: z.object({ id: objectId }),
  body: eventBody.partial(),
});

export const eventIdSchema = z.object({
  params: z.object({ id: objectId }),
});

export const reorderEventsSchema = z.object({
  body: z.object({
    ids: z.array(objectId).min(1, { message: "ids must be a non-empty array." }),
  }),
});
