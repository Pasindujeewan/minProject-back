import Assignment from "../models/assignment.model.js";
import { calculatePriority } from "../utils/calculatePriority.js";

export async function calculateAssignmentPriority(data) {
  const daysLeft = Math.ceil(
    (data.deadline - Date.now()) / (1000 * 60 * 60 * 24),
  );
  const competingAssignments = await Assignment.countDocuments({
    owner: data.owner,
    completeStatus: false,
    deadline: { $lt: data.deadline },
  });

  return calculatePriority(
    data.difficulty,
    competingAssignments,
    daysLeft,
    data.estimatedTime,
  );
}
