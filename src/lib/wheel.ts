/**
 * Rotation (in degrees) that lands the centre of `index` under the pointer at
 * the top of the wheel, after `spins` full turns. Works for any segment count.
 */
export function targetRotation(index: number, count: number, spins = 5) {
  const segmentAngle = 360 / count;
  return 360 * spins + (360 - (index * segmentAngle + segmentAngle / 2));
}

/**
 * Font size (user units) that keeps `text` inside `maxWidth` of radial space.
 * 0.58 is the average glyph-width ratio of the display font; very long names
 * bottom out at `min` and clip slightly at the hub rather than going unreadable.
 */
export function labelFontSize(text: string, maxWidth: number, base: number, min = 8) {
  return Math.max(min, Math.min(base, maxWidth / (0.58 * text.length)));
}
