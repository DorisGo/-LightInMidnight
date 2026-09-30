/**
 * Shared geometry for the 24-hour dials: midnight at the top, clockwise,
 * today on the innermost ring and each earlier day one ring further out.
 */

/** @typedef {import('../../models/trace').Trace} Trace */

export const SIZE = 360
export const C = SIZE / 2

const DAY_MS = 86400000

/**
 * @param {string} seed
 */
export function hash(seed) {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return (h >>> 0) / 4294967295
}

/** Angle for a fractional hour (0–24), midnight at the top. */
export function angleForHour(/** @type {number} */ hour) {
  return (hour / 24) * Math.PI * 2 - Math.PI / 2
}

export function angleFor(/** @type {Date} */ date) {
  return angleForHour(date.getHours() + date.getMinutes() / 60)
}

export function polar(/** @type {number} */ r, /** @type {number} */ a) {
  return { x: C + r * Math.cos(a), y: C + r * Math.sin(a) }
}

function daysAgo(/** @type {Date} */ date, /** @type {Date} */ now) {
  const a = new Date(date); a.setHours(0, 0, 0, 0)
  const b = new Date(now); b.setHours(0, 0, 0, 0)
  return Math.round((b - a) / DAY_MS)
}

/**
 * Place each moment on its day's ring at the time it was left.
 * @param {Trace[]} traces
 * @param {Date} now
 * @param {{ todayRing: number, ringStep: number, pastDays: number }} rings
 */
export function dialStars(traces, now, { todayRing, ringStep, pastDays }) {
  return traces
    .filter((trace) => !trace.span)
    .map((trace) => {
      const day = daysAgo(trace.recordedAt, now)
      if (day < 0 || day > pastDays) return null
      const radius = todayRing + day * ringStep + (hash(trace.id) - 0.5) * 4
      return {
        trace,
        day,
        ...polar(radius, angleFor(trace.recordedAt)),
        size: day === 0 ? 2.8 : 2.2 - day * 0.15,
        opacity: day === 0 ? 1 : Math.max(0.28, 0.85 - day * 0.1),
      }
    })
    .filter(Boolean)
    .sort((a, b) => a.trace.recordedAt - b.trace.recordedAt)
}
