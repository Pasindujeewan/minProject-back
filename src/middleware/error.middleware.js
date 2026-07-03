import multer from "multer";
import ApiError from "../utils/ApiError.js";

const errorHandler = (err, req, res, next) => {
  // Multer errors
  if (err instanceof multer.MulterError) {
    switch (err.code) {
      case "LIMIT_FILE_SIZE":
        return res.status(400).json({
          success: false,
          message: "PDF size must not exceed 20 MB.",
          code: "FILE_TOO_LARGE",
        });

      default:
        return res.status(400).json({
          success: false,
          message: "Upload failed.",
          code: err.code,
        });
    }
  }

  // Your custom errors
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      code: err.code,
    });
  }

  // Unknown errors
  return res.status(500).json({
    success: false,
    message: "Internal Server Error",
    code: "INTERNAL_SERVER_ERROR",
  });
};

export default errorHandler;
