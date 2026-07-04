function calculatePriority(difficulty, pendingAssignments, daysLeft) {
  // Convert workload to a 0-10 scale
  const workload = Math.min(pendingAssignments, 10);

  const priority =
    (0.6 * difficulty + 0.4 * workload) / Math.pow(daysLeft + 1, 1.5);

  let level;
  let message;

  if (priority >= 2) {
    level = "Critical";
    message = "Assignment is due very soon. Complete it immediately.";
  } else if (priority >= 1) {
    level = "High";
    message = "This assignment should be your next priority.";
  } else if (priority >= 0.5) {
    level = "Medium";
    message = "Start working on this assignment soon.";
  } else {
    level = "Low";
    message = "Plenty of time remains. Plan accordingly.";
  }

  return {
    priority: Number(priority.toFixed(2)),
    level,
    message,
  };
}
