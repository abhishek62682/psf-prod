import express from "express";
import { uploadImage, uploadMultipleImages, uploadDocumentFiles } from "./uploadController.js";
import authenticate from "../middlewares/authenticate.js";
import upload, { MAX_GALLERY_FILES, uploadDocuments, MAX_DOCUMENT_FILES } from "../middlewares/upload.js";

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

// POST /api/uploads/documents?type=event|campaign  (multiple PDFs, max 6)
uploadRouter.post(
  "/documents",
  uploadDocuments.array("documents", MAX_DOCUMENT_FILES),
  uploadDocumentFiles
);

export default uploadRouter;
