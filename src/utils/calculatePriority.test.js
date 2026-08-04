import test from "node:test";
import assert from "node:assert/strict";
import { calculatePriority } from "./calculatePriority.js";

test("priority remains within the 0-10 range", () => {
  assert.equal(calculatePriority(-20, -5, 500), 0.5);
  assert.equal(calculatePriority(50, 50, 0, 600), 10);
});

test("closer deadlines increase priority", () => {
  const tomorrow = calculatePriority(5, 1, 1);
  const nextMonth = calculatePriority(5, 1, 31);
  assert.ok(tomorrow > nextMonth);
});

test("difficulty and competing assignments increase priority", () => {
  const base = calculatePriority(2, 0, 7);
  assert.ok(calculatePriority(8, 0, 7) > base);
  assert.ok(calculatePriority(2, 4, 7) > base);
});

test("longer assignments rank above shorter assignments", () => {
  const shortTask = calculatePriority(5, 1, 7, 30);
  const longTask = calculatePriority(5, 1, 7, 600);
  assert.ok(longTask > shortTask);
});
