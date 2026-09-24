import { isSpan, traceEndDate, toDateInputValue } from '../models/trace'

/**
 * @typedef {import('../models/trace').Trace} Trace
 */

/**
 * A span's piece inside one week row.
 * @typedef {Object} SpanSegment
 * @property {Trace} trace
 * @property {number} startCol  0–6, Monday first
 * @property {number} endCol
 * @property {boolean} beginsHere  the span truly starts in this row
 * @property {boolean} endsHere    the span truly ends in this row
 * @property {number} lane
 * @property {number[]} sessionCols  columns where the person returned to it
 */

/**
 * @typedef {Object} CalendarDay
 * @property {Date} date
 * @property {string} key  'YYYY-MM-DD'
 * @property {boolean} inMonth
 * @property {boolean} isToday
 * @property {Trace[]} moments  single-day traces, plus spans that begin here
 * @property {number} hiddenSpans  spans on this day that didn't fit a lane
 */

/**
 * @typedef {Object} CalendarWeek
 * @property {string} key
 * @property {CalendarDay[]} days
 * @property {SpanSegment[]} segments
 */

export const MAX_LANES = 2

const DAY_MS = 24 * 60 * 60 * 1000

/**
 * @param {Date} date
 */
function startOfDay(date) {
  const next = new Date(date)
  next.setHours(0, 0, 0, 0)
  return next
}

/**
 * Whole days from a to b, safe across DST.
 * @param {Date} a
 * @param {Date} b
 */
function daysBetween(a, b) {
  return Math.round((startOfDay(b) - startOfDay(a)) / DAY_MS)
}

/**
 * @param {Date} date
 * @param {number} days
 */
function addDays(date, days) {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

/**
 * @param {Date} referenceDate
 */
function gridStart(referenceDate) {
  const first = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1)
  const offset = (first.getDay() + 6) % 7
  return addDays(first, -offset)
}

/**
 * Give each segment the lowest lane that is free across its columns.
 * @param {Omit<SpanSegment, 'lane'>[]} segments
 * @returns {SpanSegment[]}
 */
function assignLanes(segments) {
  const sorted = [...segments].sort(
    (a, b) => a.startCol - b.startCol || b.endCol - b.startCol - (a.endCol - a.startCol),
  )
  /** @type {number[]} last occupied column per lane */
  const laneEnds = []

  return sorted.map((segment) => {
    let lane = laneEnds.findIndex((end) => end < segment.startCol)
    if (lane === -1) lane = laneEnds.length
    laneEnds[lane] = segment.endCol
    return { ...segment, lane }
  })
}

/**
 * Lay out one month as week rows, Monday first.
 * @param {Trace[]} traces
 * @param {Date} referenceDate
 * @param {Date} [today]
 * @returns {CalendarWeek[]}
 */
export function buildMonthCalendar(traces, referenceDate, today = new Date()) {
  const month = referenceDate.getMonth()
  const monthEnd = new Date(referenceDate.getFullYear(), month + 1, 0)
  const todayKey = toDateInputValue(today)
  const spans = traces.filter(isSpan)
  const moments = traces.filter((trace) => !isSpan(trace))

  /** @type {CalendarWeek[]} */
  const weeks = []

  for (let weekStart = gridStart(referenceDate); weekStart <= monthEnd; weekStart = addDays(weekStart, 7)) {
    const weekEnd = addDays(weekStart, 6)

    const rawSegments = spans
      .map((trace) => {
        const start = startOfDay(trace.occurredAt)
        const end = startOfDay(traceEndDate(trace, today))
        if (end < weekStart || start > weekEnd) return null

        const startCol = Math.max(0, daysBetween(weekStart, start))
        const endCol = Math.min(6, daysBetween(weekStart, end))
        const sessionCols = (trace.span?.sessions ?? [])
          .map((day) => daysBetween(weekStart, new Date(`${day}T12:00:00`)))
          .filter((col) => col >= startCol && col <= endCol)

        return {
          trace,
          startCol,
          endCol,
          beginsHere: start >= weekStart,
          endsHere: end <= weekEnd,
          sessionCols,
        }
      })
      .filter(Boolean)

    const segments = assignLanes(/** @type {Omit<SpanSegment, 'lane'>[]} */ (rawSegments))

    const days = Array.from({ length: 7 }, (_, col) => {
      const date = addDays(weekStart, col)
      const key = toDateInputValue(date)
      const covering = segments.filter((s) => s.startCol <= col && s.endCol >= col)

      return {
        date,
        key,
        inMonth: date.getMonth() === month,
        isToday: key === todayKey,
        moments: [
          ...covering.filter((s) => s.beginsHere && s.startCol === col).map((s) => s.trace),
          ...moments.filter((trace) => toDateInputValue(trace.occurredAt) === key),
        ],
        hiddenSpans: covering.filter((s) => s.lane >= MAX_LANES).length,
      }
    })

    weeks.push({ key: toDateInputValue(weekStart), days, segments })
  }

  return weeks
}

/**
 * Every trace that touches a given day — met that day, or still being lived with.
 * @param {Trace[]} traces
 * @param {Date} day
 * @param {Date} [today]
 */
export function tracesOnDay(traces, day, today = new Date()) {
  const target = startOfDay(day)
  return traces.filter((trace) => {
    const start = startOfDay(trace.occurredAt)
    const end = startOfDay(traceEndDate(trace, today))
    return start <= target && target <= end
  })
}
