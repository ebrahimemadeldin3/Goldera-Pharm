import { ApiError } from "../utils/apiError.js";

export default function globalError(err, req, res, next) {
  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError")
    err = new ApiError("Your session expired. Please sign in again.", 401);
  else if (err.code === "P2025") err = new ApiError("Record not found", 404);
  else if (err.code === "P2002")
    err = new ApiError("A record with these details already exists", 409);
  else if (err.code === "P2003")
    err = new ApiError(
      "This record is used by other records. Update or remove those links first.",
      409,
    );
  else if (err.name === "PrismaClientValidationError")
    err = new ApiError(
      "Some fields are invalid. Check the form and try again.",
      400,
    );
  else if (err.code === "LIMIT_FILE_SIZE")
    err = new ApiError("File exceeds the permitted upload size", 413);
  else if (err.name === "MulterError")
    err = new ApiError("Too many files or an unexpected file field", 400);
  const statusCode = err.statusCode || err.status || 500;
  const numeric = typeof statusCode === "number" ? statusCode : 500;
  const message =
    numeric >= 500
      ? "An unexpected error occurred. Please try again."
      : err.message;
  res.status(numeric).json({
    status: numeric >= 500 ? "error" : "fail",
    statusCode: numeric,
    ...(err.code ? { code: err.code } : {}),
    ...(err.canArchive !== undefined ? { canArchive: err.canArchive } : {}),
    ...(Array.isArray(err.dependencies)
      ? { dependencies: err.dependencies }
      : {}),
    message,
  });
}
