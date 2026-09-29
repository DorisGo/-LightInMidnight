/**
 * Where a new trace lands on the canvas: somewhere open, but not random every render.
 */

/**
 * @typedef {{ x: number, y: number }} Point  percentages of the canvas
 */

/**
 * @param {string} seed
 */
function hash(seed) {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return (h >>> 0) / 4294967295
}

const MARGIN = { x: 12, top: 12, bottom: 14 }
const CANDIDATES = 24

/**
 * Try a handful of seeded spots and keep the one farthest from everything already there.
 * @param {Point[]} taken
 * @param {string} seed
 * @returns {Point & { rotation: number }}
 */
export function pickOpenSpot(taken, seed) {
  let best = { x: 50, y: 50 }
  let bestDistance = -1

  for (let i = 0; i < CANDIDATES; i++) {
    const point = {
      x: MARGIN.x + hash(`${seed}:x${i}`) * (100 - MARGIN.x * 2),
      y: MARGIN.top + hash(`${seed}:y${i}`) * (100 - MARGIN.top - MARGIN.bottom),
    }
    const nearest = taken.reduce(
      (min, other) => Math.min(min, Math.hypot(point.x - other.x, (point.y - other.y) * 0.8)),
      Infinity,
    )
    if (nearest > bestDistance) {
      best = point
      bestDistance = nearest
    }
  }

  return { ...best, rotation: Math.round((hash(`${seed}:r`) - 0.5) * 24) }
}
