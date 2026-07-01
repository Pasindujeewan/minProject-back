import jwt from "jsonwebtoken";
import ApiError from "./ApiError.js";

export const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  } catch {
    throw new ApiError(
      401,
      "Invalid or expired access token",
      "INVALID_ACCESS_TOKEN",
    );
  }
};

export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
  } catch {
    throw new ApiError(
      401,
      "Invalid or expired refresh token",
      "INVALID_REFRESH_TOKEN",
    );
  }
};
