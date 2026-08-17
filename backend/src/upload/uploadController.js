import createHttpError from "http-errors";
import { resolveUploadType, resolveDocumentUploadType } from "../middlewares/upload.js";

// POST /api/uploads/image?type=thumbnail|gallery  (single file)
const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(createHttpError(400, "Image file is required."));
    }

    const type = resolveUploadType(req);

    return res.status(201).json({
      success: true,
      message: "Image uploaded successfully.",
      data: {
        url: `/uploads/${type}/${req.file.filename}`,
        type,
      },
    });
  } catch (err) {
    return next(createHttpError(500, "Error while uploading image."));
  }
};

// POST /api/uploads/images?type=gallery  (multiple files, max 10)
const uploadMultipleImages = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return next(createHttpError(400, "At least one image is required."));
    }

    const type = resolveUploadType(req);

    return res.status(201).json({
      success: true,
      message: "Images uploaded successfully.",
      data: {
        urls: req.files.map((file) => `/uploads/${type}/${file.filename}`),
        type,
        count: req.files.length,
      },
    });
  } catch (err) {
    return next(createHttpError(500, "Error while uploading images."));
  }
};

// POST /api/uploads/documents?type=event|campaign  (multiple PDFs)
const uploadDocumentFiles = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return next(createHttpError(400, "At least one PDF file is required."));
    }

    const type = resolveDocumentUploadType(req);

    return res.status(201).json({
      success: true,
      message: "Documents uploaded successfully.",
      data: {
        urls: req.files.map((file) => `/uploads/documents/${type}/${file.filename}`),
        type,
        count: req.files.length,
      },
    });
  } catch (err) {
    return next(createHttpError(500, "Error while uploading documents."));
  }
};

export { uploadImage, uploadMultipleImages, uploadDocumentFiles };
