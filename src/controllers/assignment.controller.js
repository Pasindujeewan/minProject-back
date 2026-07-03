import fs from "fs/promises";
import asyncHandler from "../utils/asyncHandler.js";
import { analyzeAssignment } from "../services/gemini.service.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import Assignment from "../models/assignment.model.js";
import { uploadToCloudinary } from "../services/cloud.service.js";

export const analyzeController = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, "No file uploaded", "NO_FILE_UPLOADED");
  }

  const analysis = await analyzeAssignment(req.file.path);
  console.log("Analysis result:", analysis);

  const uploadResult = await uploadToCloudinary(req.file.path, "assignments");

  await Assignment.create({
    title: analysis.title,
    shortSummary: analysis.summary,
    difficulty: analysis.difficultyScore,
    estimatedTime: analysis.estimatedTime,
    pdfUrl: uploadResult.secure_url,
    publicId: uploadResult.public_id,
  });

  await fs.unlink(req.file.path);

  res.status(200).json(
    new ApiResponse(200, "Assignment analyzed and saved successfully", {
      assignment: analysis,
    }),
  );
});
