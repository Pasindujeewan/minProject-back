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
import PendingAssignment from "../models/pendingAssignment.model.js";

const isMissingText = (value) =>
  value == null ||
  String(value).trim() === "" ||
  /^(not found|unknown|null|n\/a|undefined)$/i.test(String(value).trim());

const limitSummary = (value, maximumLength = 500) => {
  if (value == null) return value;
  const summary = String(value).trim();
  if (summary.length <= maximumLength) return summary;

  const shortened = summary.slice(0, maximumLength + 1);
  const lastSpace = shortened.lastIndexOf(" ");
  return shortened.slice(0, lastSpace > 0 ? lastSpace : maximumLength).trim();
};

const getMissingFields = (data) => {
  const missingFields = [];
  if (isMissingText(data.title)) missingFields.push("title");
  if (isMissingText(data.shortSummary)) missingFields.push("shortSummary");
  if (isMissingText(data.module)) missingFields.push("module");
  if (
    !Number.isFinite(data.difficulty) ||
    data.difficulty < 0 ||
    data.difficulty > 10
  )
    missingFields.push("difficulty");
  if (!Number.isFinite(data.estimatedTime) || data.estimatedTime < 1)
    missingFields.push("estimatedTime");
  if (!(data.deadline instanceof Date) || Number.isNaN(data.deadline.getTime()))
    missingFields.push("deadline");
  return missingFields;
};

const calculateAssignmentPriority = async (data) => {
  const daysLeft = Math.ceil(
    (data.deadline - Date.now()) / (1000 * 60 * 60 * 24),
  );
  const count = await Assignment.countDocuments({
    owner: data.owner,
    completeStatus: false,
    deadline: { $lt: data.deadline },
  });
  return calculatePriority(
    data.difficulty,
    count,
    daysLeft,
    data.estimatedTime,
  );
};

export const analyzeController = asyncHandler(async (req, res) => {
  // Check if a file was uploaded
  console.log("req is", req);
  if (!req.file) {
    throw new ApiError(400, "No file uploaded", "NO_FILE_UPLOADED");
  }
  const {
    title,
    module,
    additionalInfo,
    difficultyScore,
    estimatedTime,
    deadline,
  } = req.body;
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

  // Values entered by the user take precedence over values extracted by AI.
  const assignmentData = {
    title: title || analysis.title,
    shortSummary: limitSummary(additionalInfo || analysis.summary),
    module: module || analysis.module,
    difficulty:
      difficultyScore !== undefined && difficultyScore !== ""
        ? Number(difficultyScore)
        : analysis.difficultyScore == null
          ? null
          : Number(analysis.difficultyScore),
    estimatedTime:
      estimatedTime !== undefined && estimatedTime !== ""
        ? Number(estimatedTime)
        : analysis.estimatedTime == null
          ? null
          : Number(analysis.estimatedTime),
    deadline: deadline || analysis.deadline,
  };

  const parsedDeadline = isMissingText(assignmentData.deadline)
    ? null
    : new Date(assignmentData.deadline);
  const dueDate = !parsedDeadline || Number.isNaN(parsedDeadline.getTime())
    ? null
    : parsedDeadline;

  assignmentData.deadline = dueDate;
  const missingFields = getMissingFields(assignmentData);

  // Store every analysis temporarily so the user can review and edit all fields.
  const uploadResult = await uploadToCloudinary(req.file.path, "assignments");
  const pendingAssignment = await PendingAssignment.create({
    title: isMissingText(assignmentData.title) ? null : assignmentData.title,
    shortSummary: isMissingText(assignmentData.shortSummary)
      ? null
      : assignmentData.shortSummary,
    module: isMissingText(assignmentData.module) ? null : assignmentData.module,
    difficulty: missingFields.includes("difficulty")
      ? null
      : assignmentData.difficulty,
    estimatedTime: missingFields.includes("estimatedTime")
      ? null
      : assignmentData.estimatedTime,
    deadline: missingFields.includes("deadline") ? null : assignmentData.deadline,
    pdfUrl: uploadResult.secure_url,
    publicId: uploadResult.public_id,
    owner: userId,
    missingFields,
  });
  await fs.unlink(req.file.path).catch(() => {});

  return res.status(200).json({
    success: true,
    statusCode: 200,
    code: "ASSIGNMENT_REVIEW_REQUIRED",
    message: "Assignment analyzed. Review the details before saving.",
    data: {
      pendingId: pendingAssignment._id,
      missingFields,
      fields: {
        title: pendingAssignment.title ?? "",
        shortSummary: pendingAssignment.shortSummary ?? "",
        module: pendingAssignment.module ?? "",
        difficulty: pendingAssignment.difficulty?.toString() ?? "",
        estimatedTime: pendingAssignment.estimatedTime?.toString() ?? "",
        deadline: pendingAssignment.deadline
          ? pendingAssignment.deadline.toISOString().slice(0, 10)
          : "",
      },
    },
  });
});

export const completePendingAssignment = asyncHandler(async (req, res) => {
  const { userId } = await verifyAccessToken(
    req.headers.authorization?.replace("Bearer ", ""),
  );
  if (!userId) throw new ApiError(401, "Unauthorized", "UNAUTHORIZED");

  const pending = await PendingAssignment.findOne({
    _id: req.params.pendingId,
    owner: userId,
    expiresAt: { $gt: new Date() },
  });
  if (!pending) {
    throw new ApiError(
      404,
      "Pending assignment was not found or has expired",
      "PENDING_ASSIGNMENT_NOT_FOUND",
    );
  }

  const hasField = (field) => Object.hasOwn(req.body, field);
  const data = {
    title: hasField("title") ? req.body.title : pending.title,
    shortSummary: limitSummary(
      hasField("shortSummary") ? req.body.shortSummary : pending.shortSummary,
    ),
    module: hasField("module") ? req.body.module : pending.module,
    difficulty:
      hasField("difficulty") && req.body.difficulty !== ""
        ? Number(req.body.difficulty)
        : hasField("difficulty")
          ? null
          : pending.difficulty,
    estimatedTime:
      hasField("estimatedTime") && req.body.estimatedTime !== ""
        ? Number(req.body.estimatedTime)
        : hasField("estimatedTime")
          ? null
          : pending.estimatedTime,
    deadline:
      hasField("deadline") && req.body.deadline
        ? new Date(req.body.deadline)
        : hasField("deadline")
          ? null
          : pending.deadline,
  };

  const missingFields = getMissingFields(data);
  if (missingFields.length) {
    return res.status(422).json({
      success: false,
      statusCode: 422,
      code: "MISSING_ASSIGNMENT_FIELDS",
      message: "Some assignment details are still missing or invalid.",
      data: { missingFields, pendingId: pending._id },
    });
  }

  const priority = await calculateAssignmentPriority({ ...data, owner: userId });
  const assignment = await Assignment.create({
    ...data,
    priority,
    pdfUrl: pending.pdfUrl,
    publicId: pending.publicId,
    owner: userId,
  });
  await pending.deleteOne();

  return res.status(201).json(
    new ApiResponse(201, "Assignment completed and saved successfully", {
      assignment,
      pdfUrl: assignment.pdfUrl,
    }),
  );
});
