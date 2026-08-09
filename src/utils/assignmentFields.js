const MISSING_TEXT_PATTERN = /^(not found|unknown|null|n\/a|undefined)$/i;

export const isMissingText = (value) =>
  value == null ||
  String(value).trim() === "" ||
  MISSING_TEXT_PATTERN.test(String(value).trim());

export const limitSummary = (value, maximumLength = 500) => {
  if (value == null) return value;
  const summary = String(value).trim();
  if (summary.length <= maximumLength) return summary;

  const shortened = summary.slice(0, maximumLength + 1);
  const lastSpace = shortened.lastIndexOf(" ");
  return shortened.slice(0, lastSpace > 0 ? lastSpace : maximumLength).trim();
};

const toNumberOrNull = (value) =>
  value === undefined || value === "" || value == null ? null : Number(value);

const toDateOrNull = (value) => {
  if (isMissingText(value)) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

export function buildAnalyzedAssignmentData(body, analysis) {
  return {
    title: body.title || analysis.title,
    shortSummary: limitSummary(body.additionalInfo || analysis.summary),
    module: body.module || analysis.module,
    difficulty: toNumberOrNull(
      body.difficultyScore !== undefined && body.difficultyScore !== ""
        ? body.difficultyScore
        : analysis.difficultyScore,
    ),
    estimatedTime: toNumberOrNull(
      body.estimatedTime !== undefined && body.estimatedTime !== ""
        ? body.estimatedTime
        : analysis.estimatedTime,
    ),
    deadline: toDateOrNull(body.deadline || analysis.deadline),
  };
}

export function findInvalidAssignmentFields(data) {
  const invalidFields = [];
  if (isMissingText(data.title)) invalidFields.push("title");
  if (isMissingText(data.shortSummary)) invalidFields.push("shortSummary");
  if (isMissingText(data.module)) invalidFields.push("module");
  if (
    !Number.isFinite(data.difficulty) ||
    data.difficulty < 0 ||
    data.difficulty > 10
  )
    invalidFields.push("difficulty");
  if (!Number.isFinite(data.estimatedTime) || data.estimatedTime < 1)
    invalidFields.push("estimatedTime");
  if (!(data.deadline instanceof Date) || Number.isNaN(data.deadline.getTime()))
    invalidFields.push("deadline");
  return invalidFields;
}

export function buildPendingAssignmentData(data, invalidFields) {
  return {
    title: isMissingText(data.title) ? null : data.title,
    shortSummary: isMissingText(data.shortSummary) ? null : data.shortSummary,
    module: isMissingText(data.module) ? null : data.module,
    difficulty: invalidFields.includes("difficulty") ? null : data.difficulty,
    estimatedTime: invalidFields.includes("estimatedTime")
      ? null
      : data.estimatedTime,
    deadline: invalidFields.includes("deadline") ? null : data.deadline,
  };
}

export function serializeReviewFields(pendingAssignment) {
  return {
    title: pendingAssignment.title ?? "",
    shortSummary: pendingAssignment.shortSummary ?? "",
    module: pendingAssignment.module ?? "",
    difficulty: pendingAssignment.difficulty?.toString() ?? "",
    estimatedTime: pendingAssignment.estimatedTime?.toString() ?? "",
    deadline: pendingAssignment.deadline
      ? pendingAssignment.deadline.toISOString().slice(0, 10)
      : "",
  };
}

export function mergePendingAssignmentWithReview(pendingAssignment, body) {
  const hasField = (field) => Object.hasOwn(body, field);
  return {
    title: hasField("title") ? body.title : pendingAssignment.title,
    shortSummary: limitSummary(
      hasField("shortSummary")
        ? body.shortSummary
        : pendingAssignment.shortSummary,
    ),
    module: hasField("module") ? body.module : pendingAssignment.module,
    difficulty: hasField("difficulty")
      ? toNumberOrNull(body.difficulty)
      : pendingAssignment.difficulty,
    estimatedTime: hasField("estimatedTime")
      ? toNumberOrNull(body.estimatedTime)
      : pendingAssignment.estimatedTime,
    deadline: hasField("deadline")
      ? toDateOrNull(body.deadline)
      : pendingAssignment.deadline,
  };
}
