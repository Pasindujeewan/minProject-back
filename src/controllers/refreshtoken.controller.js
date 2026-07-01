import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateToken.js";
import { verifyRefreshToken } from "../utils/verifyToken.js";

export const refreshAccessToken = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;

  if (!refreshToken) {
    throw new ApiError(
      401,
      "Refresh token is required",
      "REFRESH_TOKEN_REQUIRED",
    );
  }
  console.log("Refresh Token:", refreshToken);

  let decoded = verifyRefreshToken(refreshToken);

  console.log("Decoded Refresh Token:", decoded);
  const user = await User.findById(decoded.userId);

  if (!user) {
    throw new ApiError(404, "User not found", "USER_NOT_FOUND");
  }

  if (user.refreshToken !== refreshToken) {
    throw new ApiError(401, "Invalid refresh token", "INVALID_REFRESH_TOKEN");
  }

  const newAccessToken = generateAccessToken(user._id);
  const newRefreshToken = generateRefreshToken(user._id);

  user.refreshToken = newRefreshToken;
  await user.save({ validateBeforeSave: false });

  return res.status(200).json(
    new ApiResponse(200, "Tokens refreshed successfully", {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    }),
  );
});
