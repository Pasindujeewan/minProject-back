import Assignment from "../models/assignment.model.js";
import PendingAssignment from "../models/pendingAssignment.model.js";
import { calculateAssignmentPriority } from "../services/assignmentPriority.service.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  findInvalidAssignmentFields,
  mergePendingAssignmentWithReview,
} from "../utils/assignmentFields.js";
import { verifyAccessToken } from "../utils/verifyToken.js";
import { sendNotification } from "../services/notification.service.js";
import User from "../models/user.model.js";

export const finalizePendingAssignment = asyncHandler(async (req, res) => {
  const { userId } = await verifyAccessToken(
    req.headers.authorization?.replace("Bearer ", ""),
  );
  if (!userId) throw new ApiError(401, "Unauthorized", "UNAUTHORIZED");

  const pendingAssignment = await PendingAssignment.findOne({
    _id: req.params.pendingId,
    owner: userId,
    expiresAt: { $gt: new Date() },
  });
  if (!pendingAssignment) {
    throw new ApiError(
      404,
      "Pending assignment was not found or has expired",
      "PENDING_ASSIGNMENT_NOT_FOUND",
    );
  }

  const assignmentData = mergePendingAssignmentWithReview(
    pendingAssignment,
    req.body,
  );
  const invalidFields = findInvalidAssignmentFields(assignmentData);
  if (invalidFields.length) {
    return res.status(422).json({
      success: false,
      statusCode: 422,
      code: "MISSING_ASSIGNMENT_FIELDS",
      message: "Some assignment details are still missing or invalid.",
      data: { missingFields: invalidFields, pendingId: pendingAssignment._id },
    });
  }
  //test notifcation
  const user = await User.findById(userId);
  await sendNotification({
    token: user.expoPushToken,
    title: "New Assignment",
    body: "You have a new assignment!",
  });

  const priority = await calculateAssignmentPriority({
    ...assignmentData,
    owner: userId,
  });
  const assignment = await Assignment.create({
    ...assignmentData,
    priority,
    pdfUrl: pendingAssignment.pdfUrl,
    publicId: pendingAssignment.publicId,
    owner: userId,
  });
  await pendingAssignment.deleteOne();

  return res.status(201).json(
    new ApiResponse(201, "Assignment completed and saved successfully.", {
      assignment,
      pdfUrl: assignment.pdfUrl,
    }),
  );
});
