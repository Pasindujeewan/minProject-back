import fs from "fs/promises";
import PendingAssignment from "../models/pendingAssignment.model.js";
import { analyzeAssignmentDocument } from "../services/assignmentAnalysis.service.js";
import { uploadToCloudinary } from "../services/cloud.service.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  buildAnalyzedAssignmentData,
  buildPendingAssignmentData,
  findInvalidAssignmentFields,
  serializeReviewFields,
} from "../utils/assignmentFields.js";
import { verifyAccessToken } from "../utils/verifyToken.js";

export const analyzeAssignmentPdf = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, "No PDF file uploaded", "NO_FILE_UPLOADED");
  }

  try {
    const { userId } = await verifyAccessToken(
      req.headers.authorization?.replace("Bearer ", ""),
    );
    if (!userId) throw new ApiError(401, "Unauthorized", "UNAUTHORIZED");

    const analysis = await analyzeAssignmentDocument(req.file.path);
    const assignmentData = buildAnalyzedAssignmentData(req.body, analysis);
    const invalidFields = findInvalidAssignmentFields(assignmentData);
    const uploadResult = await uploadToCloudinary(req.file.path, "assignments");

    const pendingAssignment = await PendingAssignment.create({
      ...buildPendingAssignmentData(assignmentData, invalidFields),
      pdfUrl: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      owner: userId,
      missingFields: invalidFields,
    });

    return res.status(200).json({
      success: true,
      statusCode: 200,
      code: "ASSIGNMENT_REVIEW_REQUIRED",
      message: "Assignment analyzed. Review the details before saving.",
      data: {
        pendingId: pendingAssignment._id,
        missingFields: invalidFields,
        fields: serializeReviewFields(pendingAssignment),
      },
    });
  } finally {
    await fs.unlink(req.file.path).catch(() => {});
  }
});
