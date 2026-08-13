import express from "express";
import { getProfile, updateProfile, updatePassword, uploadAvatar } from "./profileController.js";
import { updateProfileSchema, updatePasswordSchema } from "./profileValidation.js";
import authenticate from "../middlewares/authenticate.js";
import validate from "../middlewares/validate.js";
import upload from "../middlewares/upload.js";

const profileRouter = express.Router();

profileRouter.use(authenticate);

const setProfileUploadType = (req, res, next) => {
  req.uploadType = "profile";
  next();
};

profileRouter.get("/", getProfile);
profileRouter.put("/", validate(updateProfileSchema), updateProfile);
profileRouter.put("/password", validate(updatePasswordSchema), updatePassword);
profileRouter.post("/avatar", setProfileUploadType, upload.single("avatar"), uploadAvatar);

export default profileRouter;
