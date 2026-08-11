import Assignment from "../models/assignment.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import { verifyAccessToken } from "../utils/verifyToken.js";

// Mark assignment as completed
export const completeAssignment = asyncHandler(async (req, res) => {
  const { assignmentId } = req.params;
  const { userId } = await verifyAccessToken(
    req.headers.authorization?.replace("Bearer ", ""),
  );
  const assignment = await Assignment.findOne({
    _id: assignmentId,
    owner: userId,
  });

  if (!assignment) {
    throw new ApiError(404, "Assignment not found", "NOT_FOUND");
  }

  assignment.completeStatus = true;
  await assignment.save();

  return res
    .status(200)
    .json(new ApiResponse(200, "Assignment marked as completed", assignment));
});

// Delete assignment
export const deleteAssignment = asyncHandler(async (req, res) => {
  const { assignmentId } = req.params;
  const { userId } = await verifyAccessToken(
    req.headers.authorization?.replace("Bearer ", ""),
  );
  const assignment = await Assignment.findOneAndDelete({
    _id: assignmentId,
    owner: userId,
  });

  if (!assignment) {
    throw new ApiError(404, "Assignment not found", "NOT_FOUND");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Assignment deleted successfully", assignment));
});

export const getSingleAssignment = asyncHandler(async (req, res) => {
  const { assignmentId } = req.params;
  const { userId } = await verifyAccessToken(
    req.headers.authorization?.replace("Bearer ", ""),
  );
  const assignment = await Assignment.findOne({
    _id: assignmentId,
    owner: userId,
  });

  if (!assignment) {
    throw new ApiError(404, "Assignment not found", "NOT_FOUND");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, "Assignment retrieved successfully", assignment),
    );
});
