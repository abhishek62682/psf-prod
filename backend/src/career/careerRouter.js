import express from "express";
import {
  listCareers,
  adminListCareers,
  getCareerById,
  createCareer,
  updateCareer,
  deleteCareer,
} from "./careerController.js";
import { createCareerSchema, updateCareerSchema, careerIdSchema } from "./careerValidation.js";
import authenticate from "../middlewares/authenticate.js";
import validate from "../middlewares/validate.js";

const careerRouter = express.Router();

// "/admin" must come before "/:id" — otherwise it'd match as an :id.
careerRouter.get("/admin", authenticate, adminListCareers);

// ----- Public -----
careerRouter.get("/", listCareers);

// ----- Admin -----
careerRouter.get("/:id", authenticate, validate(careerIdSchema), getCareerById);
careerRouter.post("/", authenticate, validate(createCareerSchema), createCareer);
careerRouter.patch("/:id", authenticate, validate(updateCareerSchema), updateCareer);
careerRouter.delete("/:id", authenticate, validate(careerIdSchema), deleteCareer);

export default careerRouter;
