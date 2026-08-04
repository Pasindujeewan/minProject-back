import Assignment from "../models/assignment.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import { verifyAccessToken } from "../utils/verifyToken.js";
import { calculatePriority } from "../utils/calculatePriority.js";

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

  const [assignments, totalAssignments, completeAssignments, activeAssignments] =
    await Promise.all([
      Assignment.find({ owner: ownerId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),

      Assignment.countDocuments({ owner: ownerId }),
      Assignment.countDocuments({ owner: ownerId, completeStatus: true }),
      Assignment.find({ owner: ownerId, completeStatus: false })
        .select("deadline difficulty estimatedTime priority")
        .sort({ deadline: 1 }),
    ]);

  // Recalculate active priorities because urgency and workload change over time.
  const recalculatedPriorities = new Map();
  let earlierAssignments = 0;
  for (let index = 0; index < activeAssignments.length; ) {
    const deadlineTime = activeAssignments[index].deadline.getTime();
    let groupEnd = index;
    while (
      groupEnd < activeAssignments.length &&
      activeAssignments[groupEnd].deadline.getTime() === deadlineTime
    ) {
      const item = activeAssignments[groupEnd];
      const daysLeft = Math.ceil(
        (item.deadline - Date.now()) / (1000 * 60 * 60 * 24),
      );
      recalculatedPriorities.set(
        item._id.toString(),
        calculatePriority(
          item.difficulty,
          earlierAssignments,
          daysLeft,
          item.estimatedTime,
        ),
      );
      groupEnd += 1;
    }
    earlierAssignments += groupEnd - index;
    index = groupEnd;
  }

  const priorityUpdates = activeAssignments
    .map((item) => ({
      item,
      priority: recalculatedPriorities.get(item._id.toString()),
    }))
    .filter(({ item, priority }) => item.priority !== priority)
    .map(({ item, priority }) => ({
      updateOne: {
        filter: { _id: item._id, owner: ownerId },
        update: { $set: { priority } },
      },
    }));

  if (priorityUpdates.length) await Assignment.bulkWrite(priorityUpdates);

  assignments.forEach((item) => {
    if (!item.completeStatus) {
      item.priority = recalculatedPriorities.get(item._id.toString());
    }
  });

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
