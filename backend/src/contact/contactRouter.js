import express from "express";
import {
  submitContact,
  listContactMessages,
  getContactMessage,
  updateContactStatus,
  deleteContactMessage,
} from "./contactController.js";
import {
  submitContactSchema,
  contactIdSchema,
  updateContactStatusSchema,
} from "./contactValidation.js";
import authenticate from "../middlewares/authenticate.js";
import validate from "../middlewares/validate.js";
import { contactLimiter } from "../middlewares/rateLimiter.js";

const contactRouter = express.Router();

// ----- Public -----
contactRouter.post("/", contactLimiter, validate(submitContactSchema), submitContact);

// ----- Admin (protected) -----
contactRouter.get("/", authenticate, listContactMessages);
contactRouter.get("/:id", authenticate, validate(contactIdSchema), getContactMessage);
contactRouter.patch(
  "/:id",
  authenticate,
  validate(updateContactStatusSchema),
  updateContactStatus
);
contactRouter.delete("/:id", authenticate, validate(contactIdSchema), deleteContactMessage);

export default contactRouter;
