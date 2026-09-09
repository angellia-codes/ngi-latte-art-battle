/**
 * Rotation (in degrees) that lands the centre of `index` under the pointer at
 * the top of the wheel, after `spins` full turns. Works for any segment count.
 */
export function targetRotation(index: number, count: number, spins = 5) {
  const segmentAngle = 360 / count;
  return 360 * spins + (360 - (index * segmentAngle + segmentAngle / 2));
}
