import express from "express";
import {
  listEvents,
  adminListEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  reorderEvents,
} from "./eventController.js";
import {
  createEventSchema,
  updateEventSchema,
  eventIdSchema,
  reorderEventsSchema,
} from "./eventValidation.js";
import authenticate from "../middlewares/authenticate.js";
import validate from "../middlewares/validate.js";

const eventRouter = express.Router();

// "/admin" and "/reorder" must come before "/:id" — otherwise they'd match as an :id.
eventRouter.get("/admin", authenticate, adminListEvents);
eventRouter.patch("/reorder", authenticate, validate(reorderEventsSchema), reorderEvents);

// ----- Public -----
eventRouter.get("/", listEvents);

// ----- Admin -----
eventRouter.get("/:id", authenticate, validate(eventIdSchema), getEventById);
eventRouter.post("/", authenticate, validate(createEventSchema), createEvent);
eventRouter.patch("/:id", authenticate, validate(updateEventSchema), updateEvent);
eventRouter.delete("/:id", authenticate, validate(eventIdSchema), deleteEvent);

export default eventRouter;
