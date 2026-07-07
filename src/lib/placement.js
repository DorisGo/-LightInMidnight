/**
 * @typedef {import('../models/trace').CanvasPlacement} CanvasPlacement
 */

/** Fixed canvas slots — extend this list for more traces. */
export const PREDEFINED_POSITIONS = [
  { x: 22, y: 28, rotation: -12, scale: 1 },
  { x: 50, y: 22, rotation: 8, scale: 0.95 },
  { x: 78, y: 32, rotation: -6, scale: 1.05 },
  { x: 35, y: 52, rotation: 14, scale: 0.9 },
  { x: 65, y: 48, rotation: -10, scale: 1 },
  { x: 28, y: 72, rotation: 6, scale: 0.95 },
  { x: 55, y: 68, rotation: -8, scale: 1.05 },
  { x: 82, y: 62, rotation: 12, scale: 0.9 },
]

/**
 * @param {number} index
 * @returns {CanvasPlacement}
 */
export function getPredefinedPlacement(index) {
  return PREDEFINED_POSITIONS[index % PREDEFINED_POSITIONS.length]
}
