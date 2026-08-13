import mongoose from "mongoose";
import { z } from "zod";

export const objectId = z
  .string()
  .refine((value) => mongoose.isValidObjectId(value), {
    message: "Invalid id.",
  });

/**
 * Zod validation middleware.
 * Pass a schema shaped like: z.object({ body: ..., query: ..., params: ... })
 * Parsed (and coerced) values are written back to req.body so controllers
 * always receive clean, typed data.
 */
const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse({
    body: req.body,
    query: req.query,
    params: req.params,
  });

  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: "Validation failed.",
      errors: result.error.issues.map((issue) => ({
        field: issue.path.slice(1).join("."), // drop the body/query/params prefix
        message: issue.message,
      })),
    });
  }

  if (result.data.body) req.body = result.data.body;

  next();
};

export default validate;
