import test from "node:test";
import assert from "node:assert/strict";
import {
  buildAnalyzedAssignmentData,
  findInvalidAssignmentFields,
  limitSummary,
  mergePendingAssignmentWithReview,
} from "./assignmentFields.js";

test("summary is limited at a word boundary", () => {
  const summary = `${"useful ".repeat(100)}ending`;
  const limited = limitSummary(summary, 50);
  assert.ok(limited.length <= 50);
  assert.equal(limited.endsWith(" "), false);
});

test("analysis values are normalized", () => {
  const data = buildAnalyzedAssignmentData({}, {
    title: "Machine Learning",
    summary: "Build and evaluate a model.",
    module: "AI",
    difficultyScore: "7",
    estimatedTime: "180",
    deadline: "2026-09-01",
  });

  assert.equal(data.difficulty, 7);
  assert.equal(data.estimatedTime, 180);
  assert.deepEqual(findInvalidAssignmentFields(data), []);
});

test("review values override pending values, including cleared fields", () => {
  const pending = {
    title: "Original",
    shortSummary: "Summary",
    module: "SE",
    difficulty: 5,
    estimatedTime: 60,
    deadline: new Date("2026-09-01"),
  };
  const merged = mergePendingAssignmentWithReview(pending, { title: "" });

  assert.equal(merged.title, "");
  assert.deepEqual(findInvalidAssignmentFields(merged), ["title"]);
});
