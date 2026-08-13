import express from "express";
import { uploadImage, uploadMultipleImages } from "./uploadController.js";
import authenticate from "../middlewares/authenticate.js";
import upload, { MAX_GALLERY_FILES } from "../middlewares/upload.js";

const uploadRouter = express.Router();

uploadRouter.use(authenticate);

// POST /api/uploads/image?type=thumbnail  (single — thumbnail/cover)
uploadRouter.post("/image", upload.single("image"), uploadImage);

// POST /api/uploads/images?type=gallery  (multiple — gallery, max 10)
uploadRouter.post(
  "/images",
  upload.array("images", MAX_GALLERY_FILES),
  uploadMultipleImages
);

export default uploadRouter;
