import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateToken.js";
import { registerSchema } from "../validation/auth.validation.js";

export const register = asyncHandler(async (req, res) => {
  // Data validation
  const result = registerSchema.safeParse(req.body);
  if (!result.success) {
    const errors = result.error.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));

    throw new ApiError(400, "Validation failed", "VALIDATION_ERROR", errors);
  }
  const { name, email, password } = result.data;

  // Check if email already exists
  const existingUser = await User.findOne({
    email: email,
  });

  if (existingUser) {
    throw new ApiError(409, "Email already exists", "EMAIL_ALREADY_EXISTS");
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user
  const user = await User.create({
    name: name.trim(),
    email: email,
    password: hashedPassword,
  });

  // Generate tokens
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  // Save refresh token to user
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return res.status(201).json(
    new ApiResponse("User registered successfully", {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
      accessToken,
      refreshToken,
    }),
  );
});
