/**
 * @typedef {import('../models/trace').Trace} Trace
 * @typedef {'week' | 'month' | 'year'} TimelineMode
 */

/**
 * @typedef {Object} TimelineGroupData
 * @property {string} key
 * @property {string} label
 * @property {Trace[]} traces
 */

const WEEKDAY_LABELS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
]

const MONTH_LABELS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

/**
 * @param {Trace[]} traces
 * @returns {Trace[]}
 */
export function sortTracesByEncounter(traces) {
  return [...traces].sort((a, b) => b.occurredAt - a.occurredAt)
}

/**
 * @param {Date} date
 */
function startOfDay(date) {
  const next = new Date(date)
  next.setHours(0, 0, 0, 0)
  return next
}

/**
 * @param {Date} date
 */
function startOfWeek(date) {
  const next = startOfDay(date)
  const day = next.getDay()
  const diff = day === 0 ? -6 : 1 - day
  next.setDate(next.getDate() + diff)
  return next
}

/**
 * @param {Date} date
 */
function endOfWeek(date) {
  const next = startOfWeek(date)
  next.setDate(next.getDate() + 6)
  return next
}

/**
 * @param {Trace} trace
 * @param {Date} reference
 */
function isInMonth(trace, reference) {
  const date = trace.occurredAt
  return (
    date.getFullYear() === reference.getFullYear() &&
    date.getMonth() === reference.getMonth()
  )
}

/**
 * @param {Trace} trace
 * @param {Date} reference
 */
function isInWeek(trace, reference) {
  const date = startOfDay(trace.occurredAt)
  const weekStart = startOfWeek(reference)
  const weekEnd = endOfWeek(reference)
  return date >= weekStart && date <= weekEnd
}

/**
 * @param {Trace} trace
 * @param {Date} reference
 */
function isInYear(trace, reference) {
  return trace.occurredAt.getFullYear() === reference.getFullYear()
}

/**
 * @param {TimelineMode} mode
 * @param {Date} [referenceDate]
 */
export function getPeriodTitle(mode, referenceDate = new Date()) {
  if (mode === 'year') {
    return String(referenceDate.getFullYear())
  }

  if (mode === 'month') {
    return referenceDate.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    })
  }

  const weekStart = startOfWeek(referenceDate)
  const weekEnd = endOfWeek(referenceDate)

  if (weekStart.getMonth() === weekEnd.getMonth()) {
    return `${weekStart.toLocaleDateString('en-US', { month: 'long' })} ${weekStart.getDate()} – ${weekEnd.getDate()}, ${weekStart.getFullYear()}`
  }

  return `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
}

/**
 * @param {Trace[]} traces
 * @param {TimelineMode} mode
 * @param {Date} [referenceDate]
 * @returns {TimelineGroupData[]}
 */
export function groupTraces(traces, mode, referenceDate = new Date()) {
  const sorted = sortTracesByEncounter(traces)

  if (mode === 'month') {
    const inPeriod = sorted.filter((trace) => isInMonth(trace, referenceDate))
    const byDay = new Map()

    for (const trace of inPeriod) {
      const key = trace.occurredAt.toDateString()
      if (!byDay.has(key)) byDay.set(key, [])
      byDay.get(key).push(trace)
    }

    return [...byDay.entries()]
      .sort(([a], [b]) => new Date(b) - new Date(a))
      .map(([key, groupTraces]) => ({
        key,
        label: new Date(key).toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
        }),
        traces: groupTraces,
      }))
  }

  if (mode === 'week') {
    const weekStart = startOfWeek(referenceDate)

    return WEEKDAY_LABELS.map((label, index) => {
      const day = new Date(weekStart)
      day.setDate(weekStart.getDate() + index)

      const dayTraces = sorted.filter((trace) => {
        if (!isInWeek(trace, referenceDate)) return false
        return startOfDay(trace.occurredAt).getTime() === day.getTime()
      })

      return {
        key: day.toDateString(),
        label,
        traces: dayTraces,
      }
    })
  }

  const inYear = sorted.filter((trace) => isInYear(trace, referenceDate))

  return MONTH_LABELS.map((label, monthIndex) => ({
    key: `${referenceDate.getFullYear()}-${monthIndex}`,
    label,
    traces: inYear.filter((trace) => trace.occurredAt.getMonth() === monthIndex),
  }))
}

/**
 * @param {Date} date
 */
export function formatEncounterDate(date) {
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}
