import PendingAssignment from "../models/pendingAssignment.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import { verifyAccessToken } from "../utils/verifyToken.js";

export const deletePendingAssignment = asyncHandler(async (req, res) => {
  const { assignmentId } = req.params;
  const { userId } = await verifyAccessToken(
    req.headers.authorization?.replace("Bearer ", ""),
  );

  const assignment = await PendingAssignment.findOneAndDelete({
    _id: assignmentId,
  });
  if (!assignment) {
    throw new ApiError(404, "Assignment not found", "NOT_FOUND");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, null, "Assignment deleted successfully"));
});
