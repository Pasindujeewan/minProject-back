import Assignment from "../models/assignment.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import { verifyAccessToken } from "../utils/verifyToken.js";

export const getAssignments = asyncHandler(async (req, res) => {
  const { userId: ownerId } = await verifyAccessToken(
    req.headers.authorization?.replace("Bearer ", ""),
  );

  if (!ownerId) {
    throw new ApiError(401, "Unauthorized", "UNAUTHORIZED");
  }

  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.max(parseInt(req.query.limit) || 10, 1);
  const skip = (page - 1) * limit;

  const [assignments, totalAssignments, completeAssignments] =
    await Promise.all([
      Assignment.find({ owner: ownerId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),

      Assignment.countDocuments({ owner: ownerId }),
      Assignment.countDocuments({ owner: ownerId, completeStatus: true }),
    ]);

  const totalPages = Math.ceil(totalAssignments / limit);

  return res.status(200).json(
    new ApiResponse(200, "Assignments fetched successfully", {
      assignments,
      pagination: {
        completeAssignments,
        totalAssignments,
        totalPages,
        currentPage: page,
        limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    }),
  );
});
