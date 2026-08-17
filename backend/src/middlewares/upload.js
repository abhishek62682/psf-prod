import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import multer from "multer";
import createHttpError from "http-errors";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const uploadDir = path.resolve(__dirname, "../../public/uploads");

// Organized upload folders. Whitelist prevents path traversal
// (never trust req.query directly in a filesystem path).
export const ALLOWED_TYPES = ["thumbnail", "gallery", "screenshot", "profile", "event"];

// Resolves the upload type from the request:
// req.uploadType (set by route, e.g. donations/profile) > ?type= query
// Returns null when the type is missing/invalid — callers must reject,
// there is no generic "misc" fallback.
export const resolveUploadType = (req) => {
  const type = req.uploadType || req.query.type;
  return ALLOWED_TYPES.includes(type) ? type : null;
};

const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];
// Some clients (curl, certain mobile apps) send octet-stream for images,
// so we validate the extension AND accept only image-like mimetypes.
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/octet-stream",
];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
export const MAX_GALLERY_FILES = 10;

// Document (PDF) uploads for events/campaigns — separate whitelist/folder
// from the image types above so PDFs never land in an image-only directory.
export const ALLOWED_DOCUMENT_TYPES = ["event", "campaign"];

export const resolveDocumentUploadType = (req) => {
  const type = req.uploadType || req.query.type;
  return ALLOWED_DOCUMENT_TYPES.includes(type) ? type : null;
};

const DOCUMENT_ALLOWED_EXTENSIONS = [".pdf"];
const DOCUMENT_ALLOWED_MIME_TYPES = ["application/pdf", "application/octet-stream"];
const MAX_DOCUMENT_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
// Highest per-entity cap (event: 6, campaign: 6) — exact limits are enforced
// by Zod validation on the entity payload; this only bounds the multer array.
export const MAX_DOCUMENT_FILES = 6;

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const type = resolveUploadType(req);
    if (!type) {
      return cb(
        createHttpError(
          400,
          "A valid upload type is required. Allowed: thumbnail, gallery, screenshot, profile, event."
        )
      );
    }
    const dir = path.join(uploadDir, type);
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();

  if (
    !ALLOWED_EXTENSIONS.includes(ext) ||
    !ALLOWED_MIME_TYPES.includes(file.mimetype)
  ) {
    return cb(
      createHttpError(400, "Only JPEG, PNG and WEBP images are allowed.")
    );
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
});

const documentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const type = resolveDocumentUploadType(req);
    if (!type) {
      return cb(
        createHttpError(400, "A valid upload type is required. Allowed: event, campaign.")
      );
    }
    const dir = path.join(uploadDir, "documents", type);
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${ext}`);
  },
});

const documentFileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();

  if (
    !DOCUMENT_ALLOWED_EXTENSIONS.includes(ext) ||
    !DOCUMENT_ALLOWED_MIME_TYPES.includes(file.mimetype)
  ) {
    return cb(createHttpError(400, "Only PDF files are allowed."));
  }
  cb(null, true);
};

export const uploadDocuments = multer({
  storage: documentStorage,
  fileFilter: documentFileFilter,
  limits: { fileSize: MAX_DOCUMENT_FILE_SIZE },
});

// Deletes a previously uploaded file given its stored "/uploads/..." URL —
// used whenever a controller replaces or clears an image (QR code, avatar,
// campaign cover/gallery) so the old file doesn't linger on disk. Silently
// no-ops on anything that isn't a real "/uploads/" path, and swallows
// ENOENT (already gone) so callers never need their own try/catch for it.
export const deleteUploadedFile = (urlPath) => {
  if (!urlPath || typeof urlPath !== "string" || !urlPath.startsWith("/uploads/")) return;

  const relative = urlPath.slice("/uploads/".length);
  const filePath = path.join(uploadDir, relative);

  if (!filePath.startsWith(uploadDir)) return;

  fs.unlink(filePath, (err) => {
    if (err && err.code !== "ENOENT") {
      console.error(`Failed to delete uploaded file: ${filePath}`, err);
    }
  });
};

export default upload;
