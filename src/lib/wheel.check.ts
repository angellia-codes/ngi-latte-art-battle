// Run: node --experimental-strip-types src/lib/wheel.check.ts
import assert from "node:assert/strict";
import {
  estimateTextWidth,
  fitFontSize,
  targetRotation,
  truncateToWidth,
  wedgeWidth,
} from "./wheel.ts";

// 5 segments, 72° each: first segment centre sits 36° past the top.
assert.equal(targetRotation(0, 5), 1800 + 324);
assert.equal(targetRotation(4, 5), 1800 + 36);

// Neighbouring segments are exactly one segment apart.
assert.equal(targetRotation(0, 10) - targetRotation(1, 10), 36);

// Single segment: half a turn puts its centre at the top.
assert.equal(targetRotation(0, 1), 1800 + 180);

// spins is configurable and only adds whole turns.
assert.equal(targetRotation(2, 8, 3) - targetRotation(2, 8, 0), 1080);

// Long labels shrink to fit the radial run; short ones keep the max size.
const run = 130;
const long = fitFontSize("Putu Agus Adi Rio Cornelius", { maxWidth: run, maxSize: 20, minSize: 8 });
const short = fitFontSize("Swan", { maxWidth: run, maxSize: 20, minSize: 8 });
assert.ok(long < short, "a longer label must get a smaller font");
assert.equal(short, 20);
assert.ok(estimateTextWidth("Putu Agus Adi Rio Cornelius", long) <= run + 0.001);

// Clamps hold at both ends.
assert.equal(fitFontSize("x".repeat(500), { maxWidth: run, maxSize: 20, minSize: 8 }), 8);
assert.equal(fitFontSize("", { maxWidth: run, maxSize: 20, minSize: 8 }), 8);

// Truncation only bites when the text still overflows at the given size.
assert.equal(truncateToWidth("Swan", 20, run), "Swan");
const clipped = truncateToWidth("x".repeat(500), 8, run);
assert.ok(clipped.endsWith("…"));
assert.ok(estimateTextWidth(clipped, 8) <= run);

// Wedge chords: narrower as segments multiply, full diameter for one segment.
assert.equal(wedgeWidth(56, 1), 112);
assert.ok(wedgeWidth(56, 10) < wedgeWidth(56, 5));
assert.ok(Math.abs(wedgeWidth(56, 4) - 2 * 56 * Math.SQRT1_2) < 1e-9);

console.log("wheel.check.ts ok");
