import { isSpan, traceEndDate } from '../models/trace'

/**
 * Geometry for the year view: a year is a circle, read clockwise from the top.
 * Moments become stars on the outer band; spans become arcs on the inner band.
 */

/**
 * @typedef {import('../models/trace').Trace} Trace
 */

/**
 * @typedef {Object} Star
 * @property {Trace} trace
 * @property {number} x
 * @property {number} y
 * @property {number} size
 * @property {number} twinkleDelay  seconds
 */

/**
 * @typedef {Object} Arc
 * @property {Trace} trace
 * @property {string} path
 * @property {number} radius
 * @property {boolean} beginsInYear
 * @property {boolean} endsInYear
 * @property {{ x: number, y: number }} head  where the arc ends
 * @property {{ x: number, y: number }[]} sessions
 */

export const SIZE = 360
export const CENTER = SIZE / 2

const STAR_BAND = { inner: 108, outer: 142 }
const ARC_OUTER = 94
const ARC_STEP = 8
const ARC_LANES = 6

const DAY_MS = 24 * 60 * 60 * 1000

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

/**
 * @param {number} year
 */
function daysInYear(year) {
  return (new Date(year + 1, 0, 1) - new Date(year, 0, 1)) / DAY_MS
}

/**
 * 0-based day of the year, DST-safe.
 * @param {Date} date
 */
function dayOfYear(date) {
  const start = Date.UTC(date.getFullYear(), 0, 1)
  const day = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  return Math.round((day - start) / DAY_MS)
}

/**
 * Angle for a (fractional) day, 0 at the top, clockwise.
 * @param {number} day
 * @param {number} total
 */
function angleFor(day, total) {
  return (day / total) * Math.PI * 2 - Math.PI / 2
}

/**
 * @param {number} radius
 * @param {number} angle
 */
export function polar(radius, angle) {
  return {
    x: CENTER + radius * Math.cos(angle),
    y: CENTER + radius * Math.sin(angle),
  }
}

/**
 * @param {number} radius
 * @param {number} from  angle
 * @param {number} to    angle
 */
function arcPath(radius, from, to) {
  const start = polar(radius, from)
  const end = polar(radius, to)
  const large = to - from > Math.PI ? 1 : 0
  return `M ${start.x.toFixed(2)} ${start.y.toFixed(2)} A ${radius} ${radius} 0 ${large} 1 ${end.x.toFixed(2)} ${end.y.toFixed(2)}`
}

/**
 * Month ticks and label positions around the rim.
 * @param {number} year
 */
export function monthMarks(year) {
  const total = daysInYear(year)
  return Array.from({ length: 12 }, (_, month) => {
    const first = dayOfYear(new Date(year, month, 1))
    const next = month === 11 ? total : dayOfYear(new Date(year, month + 1, 1))
    const tickAngle = angleFor(first, total)
    const labelAngle = angleFor((first + next) / 2, total)
    return {
      month,
      tickFrom: polar(STAR_BAND.outer + 6, tickAngle),
      tickTo: polar(STAR_BAND.outer + 12, tickAngle),
      label: polar(STAR_BAND.outer + 22, labelAngle),
    }
  })
}

/**
 * @param {Date} today
 * @param {number} year
 */
export function todayMark(today, year) {
  if (today.getFullYear() !== year) return null
  const angle = angleFor(dayOfYear(today) + 0.5, daysInYear(year))
  return { from: polar(ARC_OUTER - ARC_STEP * ARC_LANES, angle), to: polar(STAR_BAND.outer + 4, angle) }
}

/**
 * @param {Trace[]} traces
 * @param {number} year
 * @param {Date} [today]
 * @returns {{ stars: Star[], arcs: Arc[], links: { x1: number, y1: number, x2: number, y2: number }[] }}
 */
export function buildStarMap(traces, year, today = new Date()) {
  const total = daysInYear(year)
  const yearStart = new Date(year, 0, 1)
  const yearEnd = new Date(year, 11, 31, 23, 59)

  const stars = traces
    .filter((trace) => !isSpan(trace) && trace.occurredAt.getFullYear() === year)
    .sort((a, b) => a.occurredAt - b.occurredAt)
    .map((trace) => {
      const jitter = hash(trace.id)
      const radius = STAR_BAND.inner + jitter * (STAR_BAND.outer - STAR_BAND.inner)
      const day = dayOfYear(trace.occurredAt) + 0.2 + hash(`${trace.id}:a`) * 0.6
      return {
        trace,
        ...polar(radius, angleFor(day, total)),
        size: 1.6 + hash(`${trace.id}:s`) * 1.6,
        twinkleDelay: hash(`${trace.id}:t`) * 6,
      }
    })

  // Faint lines between neighbouring stars of the same month — each month its own constellation.
  const links = []
  for (let i = 1; i < stars.length; i++) {
    const prev = stars[i - 1]
    const star = stars[i]
    if (prev.trace.occurredAt.getMonth() !== star.trace.occurredAt.getMonth()) continue
    links.push({ x1: prev.x, y1: prev.y, x2: star.x, y2: star.y })
  }

  const spans = traces
    .filter(isSpan)
    .map((trace) => ({ trace, start: trace.occurredAt, end: traceEndDate(trace, today) }))
    .filter(({ start, end }) => end >= yearStart && start <= yearEnd)
    .sort((a, b) => a.start - b.start)

  /** @type {number[]} last day occupied per lane */
  const laneEnds = []

  const arcs = spans.map(({ trace, start, end }) => {
    const beginsInYear = start >= yearStart
    const endsInYear = end <= yearEnd
    const from = beginsInYear ? dayOfYear(start) : 0
    const to = endsInYear ? dayOfYear(end) + 1 : total

    let lane = laneEnds.findIndex((last) => last < from)
    if (lane === -1) lane = laneEnds.length < ARC_LANES ? laneEnds.length : laneEnds.indexOf(Math.min(...laneEnds))
    laneEnds[lane] = to

    const radius = ARC_OUTER - lane * ARC_STEP
    const fromAngle = angleFor(from + 0.1, total)
    // Keep one-day spans visible as a short dash.
    const toAngle = angleFor(Math.max(to - 0.1, from + 0.8), total)

    const sessions = (trace.span?.sessions ?? [])
      .map((key) => new Date(`${key}T12:00:00`))
      .filter((date) => date.getFullYear() === year)
      .map((date) => polar(radius, angleFor(dayOfYear(date) + 0.5, total)))

    return {
      trace,
      path: arcPath(radius, fromAngle, toAngle),
      radius,
      beginsInYear,
      endsInYear,
      head: polar(radius, toAngle),
      sessions,
    }
  })

  return { stars, arcs, links }
}
