// Run: node --experimental-strip-types src/lib/wheel.check.ts
import assert from "node:assert/strict";
import { labelFontSize, targetRotation } from "./wheel.ts";

// 5 segments, 72° each: first segment centre sits 36° past the top.
assert.equal(targetRotation(0, 5), 1800 + 324);
assert.equal(targetRotation(4, 5), 1800 + 36);

// Neighbouring segments are exactly one segment apart.
assert.equal(targetRotation(0, 10) - targetRotation(1, 10), 36);

// Single segment: half a turn puts its centre at the top.
assert.equal(targetRotation(0, 1), 1800 + 180);

// spins is configurable and only adds whole turns.
assert.equal(targetRotation(2, 8, 3) - targetRotation(2, 8, 0), 1080);

// labelFontSize: short labels keep the base size, long ones shrink but never
// past the floor, and the result is always inside [min, base].
assert.equal(labelFontSize("Ayu", 160, 16), 16);
assert.equal(labelFontSize("x".repeat(40), 160, 16), 8);
for (const name of ["A", "Ni Kadek Ayu Pratiwi", "The Bakery Uluwatu", "x".repeat(80)]) {
  const size = labelFontSize(name, 160, 16);
  assert.ok(size <= 16 && size >= 8, `${name} -> ${size}`);
}
// A name that only just overflows shrinks to fit rather than clipping.
assert.ok(labelFontSize("Ni Kadek Ayu Pratiwi", 160, 16) < 16);

console.log("wheel.check.ts ok");
