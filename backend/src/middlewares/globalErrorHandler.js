import { config } from "../config/config.js";

// eslint-disable-next-line no-unused-vars
const globalErrorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  return res.status(statusCode).json({
    success: false,
    message: err.message || "Internal server error.",
    errors: err.errors || [],
    ...(config.env === "development" && { errorStack: err.stack }),
  });
};

export default globalErrorHandler;
