import Assignment from "../models/assignment.model.js";
import User from "../models/user.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import { sendNotification } from "./notification.service.js";
import { calculateAssignmentPriority } from "./assignmentPriority.service.js";

export const checkAssignmentPriorities = asyncHandler(async () => {
  console.log("Checking assignment priorities and sending notifications...");
  const now = new Date();

  const assignments = await Assignment.find({
    completeStatus: false,
    deadline: { $gte: now },
    highPriorityNotificationSent: false,
  }).lean();

  for (const assignment of assignments) {
    const priority = await calculateAssignmentPriority(assignment);
    const userToken = await User.findById(assignment.owner)
      .select("expoPushToken")
      .lean();

    if (priority >= 8) {
      await sendNotification({
        token: userToken.expoPushToken,
        title: "High Priority Assignment",
        body: `Your assignment "${assignment.title}" is high priority!`,
        data: {
          type: "assignment",
          assignmentId: assignment._id.toString(),
        },
      });
      await Assignment.updateOne(
        { _id: assignment._id },
        { $set: { highPriorityNotificationSent: true } },
      );
    }
  }
  console.log("Assignment priority check completed.");
});
