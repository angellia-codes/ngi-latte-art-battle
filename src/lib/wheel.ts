/**
 * Rotation (in degrees) that lands the centre of `index` under the pointer at
 * the top of the wheel, after `spins` full turns. Works for any segment count.
 */
export function targetRotation(index: number, count: number, spins = 5) {
  const segmentAngle = 360 / count;
  return 360 * spins + (360 - (index * segmentAngle + segmentAngle / 2));
}

/**
 * Rough average glyph width as a fraction of the font size. Good enough to fit
 * labels without measuring text in the DOM (the wheel renders on the server too).
 */
const AVG_GLYPH_RATIO = 0.52;

export function estimateTextWidth(text: string, fontSize: number) {
  return text.length * fontSize * AVG_GLYPH_RATIO;
}

/**
 * Largest font size (clamped to [minSize, maxSize]) at which `text` is expected
 * to fit inside `maxWidth`.
 */
export function fitFontSize(
  text: string,
  { maxWidth, maxSize, minSize }: { maxWidth: number; maxSize: number; minSize: number }
) {
  if (!text) return minSize;
  const ideal = maxWidth / (text.length * AVG_GLYPH_RATIO);
  return Math.max(minSize, Math.min(maxSize, ideal));
}

/** Ellipsises `text` so it fits `maxWidth` at `fontSize`. Only bites at the min size. */
export function truncateToWidth(text: string, fontSize: number, maxWidth: number) {
  if (estimateTextWidth(text, fontSize) <= maxWidth) return text;
  const maxChars = Math.max(1, Math.floor(maxWidth / (fontSize * AVG_GLYPH_RATIO)) - 1);
  return `${text.slice(0, maxChars).trimEnd()}…`;
}

/** Width of a wedge (its chord) at distance `r` from the centre, for `count` equal segments. */
export function wedgeWidth(r: number, count: number) {
  return count <= 2 ? 2 * r : 2 * r * Math.sin(Math.PI / count);
}
