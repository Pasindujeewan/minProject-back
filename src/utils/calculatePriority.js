const clamp = (value, minimum, maximum) =>
  Math.min(Math.max(value, minimum), maximum);

function calculateUrgency(daysLeft) {
  if (daysLeft <= 1) return 10;
  if (daysLeft <= 3) return 9;
  if (daysLeft <= 7) return 7.5;
  if (daysLeft <= 14) return 5.5;
  if (daysLeft <= 30) return 3;
  return 1;
}

/**
 * Return a priority score from 0 to 10.
 * Urgency is the strongest factor, followed by difficulty, competing work,
 * and the estimated effort required.
 */
export function calculatePriority(
  difficulty,
  pendingAssignments,
  daysLeft,
  estimatedMinutes = 0,
) {
  const difficultyScore = clamp(Number(difficulty) || 0, 0, 10);
  const competingAssignments = Math.max(
    0,
    Number.isFinite(Number(pendingAssignments))
      ? Number(pendingAssignments)
      : 0,
  );
  const normalizedDays = Number.isFinite(Number(daysLeft))
    ? Number(daysLeft)
    : 365;

  // Each assignment due sooner adds two workload points, capped at 10.
  const workloadScore = clamp(competingAssignments * 2, 0, 10);
  const urgencyScore = calculateUrgency(normalizedDays);
  const effortScore = clamp((Number(estimatedMinutes) / 60) * 1.5 || 0, 0, 10);

  const priority =
    urgencyScore * 0.45 +
    difficultyScore * 0.25 +
    workloadScore * 0.15 +
    effortScore * 0.15;

  return Number(clamp(priority, 0, 10).toFixed(1));
}
