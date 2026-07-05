import fs from "fs/promises";
import asyncHandler from "../utils/asyncHandler.js";
import { analyzeAssignment } from "../services/gemini.service.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import Assignment from "../models/assignment.model.js";
import { uploadToCloudinary } from "../services/cloud.service.js";
import { verifyAccessToken } from "../utils/verifyToken.js";
import { analyzePdfFallback } from "../services/pdfFallback.service.js";
import { calculatePriority } from "../utils/calculatePriority.js";

export const analyzeController = asyncHandler(async (req, res) => {
  // Check if a file was uploaded
  console.log("req is", req);
  if (!req.file) {
    throw new ApiError(400, "No file uploaded", "NO_FILE_UPLOADED");
  }
  const { title, module, additionalInfo } = req.body;
  console.log(
    "Received file:",
    req.headers.authorization?.replace("Bearer ", ""),
  );
  // Verify the access token from the request headers
  const { userId } = await verifyAccessToken(
    req.headers.authorization?.replace("Bearer ", ""),
  );

  if (!userId) {
    throw new ApiError(401, "Unauthorized", "UNAUTHORIZED");
  }

  // Analyze the uploaded assignment file
  let analysis;
  try {
    analysis = await analyzeAssignment(req.file.path);
  } catch (error) {
    console.error("Error analyzing assignment:", error);
    analysis = await analyzePdfFallback(req.file.path);
  }
  console.log("Analysis result:", analysis);

  const dueDate = isNaN(new Date(analysis.deadline).getTime())
    ? null
    : new Date(analysis.deadline);
  console.log("Due date:", dueDate);

  let count = 0;
  let priorityResult = 0;
  const daysLeft = Math.max(
    Math.ceil((dueDate - Date.now()) / (1000 * 60 * 60 * 24)),
    1,
  );
  console.log("Days left:", daysLeft);
  if (dueDate) {
    count = await Assignment.countDocuments({
      deadline: { $lt: dueDate },
    });
    priorityResult = calculatePriority(
      analysis.difficultyScore,
      count,
      daysLeft,
    );
  }
  console.log("Pending assignments count:", count);
  console.log("Calculated priority:", priorityResult);

  // Upload the file to Cloudinary and save the analysis result to the database
  const uploadResult = await uploadToCloudinary(req.file.path, "assignments");

  // Save the assignment details to the database
  const assignment = await Assignment.create({
    title: title || analysis.title,
    shortSummary: additionalInfo || analysis.summary,
    module: module || analysis.module,
    difficulty: analysis.difficultyScore,
    estimatedTime: analysis.estimatedTime,
    deadline: dueDate,
    priority: priorityResult,
    pdfUrl: uploadResult.secure_url,
    publicId: uploadResult.public_id,
    owner: userId,
  });

  // Delete the uploaded file from the server after processing
  await fs.unlink(req.file.path);

  res.status(200).json(
    new ApiResponse(200, "Assignment analyzed and saved successfully", {
      assignment: assignment,
      pdfUrl: uploadResult.secure_url,
    }),
  );
});
