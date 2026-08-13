import createHttpError from "http-errors";
import jwt from "jsonwebtoken";
import { config } from "../config/config.js";
import adminModel from "../auth/adminModel.js";

const authenticate = async (req, res, next) => {
  const authHeader = req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(createHttpError(401, "Authorization token is required."));
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, config.jwtSecret);

    const admin = await adminModel.findById(decoded.sub).select("_id");
    if (!admin) {
      return next(createHttpError(401, "Account no longer exists."));
    }

    req.adminId = decoded.sub;
    next();
  } catch {
    return next(createHttpError(401, "Token expired or invalid."));
  }
};

export default authenticate;
