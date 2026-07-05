export function calculatePriority(difficulty, pendingAssignments, daysLeft) {
  // Convert workload to a 0-10 scale
  console.log(
    "Calculating priority with difficulty:",
    difficulty,
    "pendingAssignments:",
    pendingAssignments,
    "daysLeft:",
    daysLeft,
  );
  const workload = Math.min(pendingAssignments, 10);

  const priority =
    (0.6 * difficulty + 0.4 * workload) / Math.pow(daysLeft + 1, 1.5);

  return Number(priority.toFixed(2));
}
