/**
 * @typedef {'star'|'triangle'|'square'|'diamond'|'target'|'dots'|'squiggle'} MarkType
 */

/**
 * @typedef {'book'|'movie'|'music'|'place'|'other'} TraceCategory
 */

/**
 * @typedef {Object} CanvasPlacement
 * @property {number} x
 * @property {number} y
 * @property {number} rotation
 * @property {number} scale
 */

/**
 * @typedef {'ongoing'|'finished'|'paused'} SpanStatus
 */

/**
 * A trace that lasted a while — a book, a series. `occurredAt` is where it began.
 * @typedef {Object} TraceSpan
 * @property {SpanStatus} status
 * @property {Date|null} endedAt  null while still ongoing
 * @property {string[]} sessions  'YYYY-MM-DD' days the person returned to it
 */

/**
 * Where a trace's cover and details came from.
 * @typedef {Object} TraceSource
 * @property {'neodb'} provider
 * @property {string} id
 * @property {string} [url]
 */

/**
 * @typedef {Object} TraceInput
 * @property {string} memory
 * @property {TraceCategory} category
 * @property {Date} occurredAt
 * @property {Date} recordedAt
 * @property {string} [note]
 * @property {string} [cover]
 * @property {string} [subtitle]
 * @property {TraceSource} [source]
 * @property {{ status: SpanStatus, endedAt: Date|null }} [span]
 */

/**
 * One encounter between a person and the world.
 * @typedef {Object} Trace
 * @property {string} id
 * @property {Date} occurredAt
 * @property {Date} recordedAt
 * @property {MarkType} mark
 * @property {CanvasPlacement} placement
 * @property {string} memory
 * @property {TraceCategory} category
 * @property {string} [note]
 * @property {string} [cover]
 * @property {string} [subtitle]
 * @property {TraceSource} [source]
 * @property {TraceSpan} [span]
 */

export const MARK_TYPES = ['star', 'triangle', 'square', 'diamond', 'target', 'dots', 'squiggle']

export const TRACE_CATEGORIES = ['book', 'movie', 'music', 'place', 'other']

/** @type {Record<TraceCategory, string>} */
export const CATEGORY_LABELS = {
  book: 'Book',
  movie: 'Movie',
  music: 'Music',
  place: 'Place',
  other: 'Other',
}

/** Categories that usually take more than a day to meet. */
export const SPAN_CATEGORIES = ['book']

/** @type {Record<SpanStatus, string>} */
export const SPAN_STATUS_LABELS = {
  ongoing: 'Still with it',
  finished: 'Finished',
  paused: 'Set aside',
}

/** @type {Record<TraceCategory, MarkType>} */
export const CATEGORY_MARK_MAP = {
  book: 'square',
  movie: 'target',
  music: 'squiggle',
  place: 'diamond',
  other: 'star',
}

/**
 * @param {TraceCategory} category
 * @returns {MarkType}
 */
export function markForCategory(category) {
  return CATEGORY_MARK_MAP[category] ?? 'star'
}

/**
 * When the user met what they recorded.
 * @param {Trace} trace
 * @returns {Date}
 */
export function encounterDate(trace) {
  return trace.occurredAt
}

/**
 * @param {Trace} trace
 */
export function isSpan(trace) {
  return Boolean(trace.span)
}

/**
 * The last day a trace covers. Ongoing spans reach up to `today`.
 * @param {Trace} trace
 * @param {Date} [today]
 * @returns {Date}
 */
export function traceEndDate(trace, today = new Date()) {
  if (!trace.span) return trace.occurredAt
  return trace.span.endedAt ?? (today > trace.occurredAt ? today : trace.occurredAt)
}

/**
 * @param {{ status: SpanStatus, endedAt: Date|null }} [span]
 * @param {string[]} [sessions]
 * @returns {TraceSpan|undefined}
 */
function buildSpan(span, sessions = []) {
  if (!span) return undefined
  return {
    status: span.status,
    endedAt: span.status === 'ongoing' ? null : span.endedAt,
    sessions,
  }
}

/**
 * Optional fields shared by create and update.
 * @param {TraceInput | Omit<TraceInput, 'recordedAt'>} input
 */
function optionalFields(input) {
  const note = input.note?.trim()
  return {
    ...(note ? { note } : {}),
    ...(input.cover ? { cover: input.cover } : {}),
    ...(input.subtitle ? { subtitle: input.subtitle } : {}),
    ...(input.source ? { source: input.source } : {}),
  }
}

const LEGACY_STORAGE_KEY = 'light-in-midnight-events'
export const STORAGE_KEY = 'light-in-midnight-traces'

/**
 * @param {TraceInput} input
 * @returns {Trace}
 */
export function createTrace(input) {
  return {
    id: crypto.randomUUID(),
    occurredAt: input.occurredAt,
    recordedAt: input.recordedAt,
    mark: markForCategory(input.category),
    placement: { x: 0, y: 0, rotation: 0, scale: 1 },
    memory: input.memory,
    category: input.category,
    ...optionalFields(input),
    ...(input.span ? { span: buildSpan(input.span) } : {}),
  }
}

/**
 * @param {Trace} trace
 * @param {Omit<TraceInput, 'recordedAt'>} input
 * @returns {Trace}
 */
export function applyTraceUpdate(trace, input) {
  const { note, cover, subtitle, source, span, ...rest } = trace

  /** @type {Trace} */
  const updated = {
    ...rest,
    memory: input.memory,
    category: input.category,
    occurredAt: input.occurredAt,
    mark: markForCategory(input.category),
    ...optionalFields(input),
  }

  if (input.span) {
    updated.span = buildSpan(input.span, span?.sessions)
  }

  return updated
}

/**
 * Mark or unmark a day the person returned to a span.
 * @param {Trace} trace
 * @param {string} dayKey 'YYYY-MM-DD'
 * @returns {Trace}
 */
export function toggleSpanSession(trace, dayKey) {
  if (!trace.span) return trace
  const sessions = trace.span.sessions.includes(dayKey)
    ? trace.span.sessions.filter((day) => day !== dayKey)
    : [...trace.span.sessions, dayKey].sort()
  return { ...trace, span: { ...trace.span, sessions } }
}

/**
 * @param {Trace} trace
 * @param {SpanStatus} status
 * @param {Date} [on]
 * @returns {Trace}
 */
export function setSpanStatus(trace, status, on = new Date()) {
  if (!trace.span) return trace
  return { ...trace, span: buildSpan({ status, endedAt: on }, trace.span.sessions) }
}

/**
 * @param {unknown} raw
 * @returns {TraceSpan|undefined}
 */
function parseSpan(raw) {
  if (!raw || typeof raw !== 'object') return undefined
  const record = /** @type {Record<string, unknown>} */ (raw)
  const status = /** @type {SpanStatus} */ (
    ['ongoing', 'finished', 'paused'].includes(/** @type {string} */ (record.status))
      ? record.status
      : 'ongoing'
  )
  return {
    status,
    endedAt: record.endedAt && status !== 'ongoing'
      ? new Date(/** @type {string} */ (record.endedAt))
      : null,
    sessions: Array.isArray(record.sessions)
      ? record.sessions.filter((day) => typeof day === 'string')
      : [],
  }
}

/**
 * @param {unknown} raw
 * @returns {Trace|null}
 */
export function parseTrace(raw) {
  if (!raw || typeof raw !== 'object') return null

  const record = /** @type {Record<string, unknown>} */ (raw)
  const id = record.id
  const occurredAtRaw = record.occurredAt ?? record.timestamp
  const recordedAtRaw = record.recordedAt ?? occurredAtRaw
  const mark = record.mark ?? record.symbol
  const placement = record.placement ?? record.position

  if (typeof id !== 'string' || !occurredAtRaw || !recordedAtRaw || !mark || !placement) return null

  /** @type {Trace} */
  const trace = {
    id,
    occurredAt: new Date(/** @type {string|number|Date} */ (occurredAtRaw)),
    recordedAt: new Date(/** @type {string|number|Date} */ (recordedAtRaw)),
    mark: /** @type {MarkType} */ (mark),
    placement: /** @type {CanvasPlacement} */ (placement),
    memory: typeof record.memory === 'string'
      ? record.memory
      : typeof record.note === 'string'
        ? record.note
        : '',
    category: TRACE_CATEGORIES.includes(/** @type {string} */ (record.category))
      ? /** @type {TraceCategory} */ (record.category)
      : 'other',
  }

  if (typeof record.note === 'string' && record.note) {
    trace.note = record.note
  }
  if (typeof record.cover === 'string' && record.cover) {
    trace.cover = record.cover
  }
  if (typeof record.subtitle === 'string' && record.subtitle) {
    trace.subtitle = record.subtitle
  }
  if (record.source && typeof record.source === 'object') {
    trace.source = /** @type {TraceSource} */ (record.source)
  }
  const span = parseSpan(record.span)
  if (span) trace.span = span

  return trace
}

/**
 * @param {Trace} trace
 */
export function serializeTrace(trace) {
  return {
    id: trace.id,
    occurredAt: trace.occurredAt.toISOString(),
    recordedAt: trace.recordedAt.toISOString(),
    mark: trace.mark,
    placement: trace.placement,
    memory: trace.memory,
    category: trace.category,
    ...(trace.note ? { note: trace.note } : {}),
    ...(trace.cover ? { cover: trace.cover } : {}),
    ...(trace.subtitle ? { subtitle: trace.subtitle } : {}),
    ...(trace.source ? { source: trace.source } : {}),
    ...(trace.span
      ? {
          span: {
            status: trace.span.status,
            endedAt: trace.span.endedAt ? trace.span.endedAt.toISOString() : null,
            sessions: trace.span.sessions,
          },
        }
      : {}),
  }
}

/**
 * @returns {Trace[]}
 */
export function loadTraces() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(LEGACY_STORAGE_KEY)
    if (!raw) return []

    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []

    return parsed.map(parseTrace).filter(Boolean)
  } catch {
    return []
  }
}

/**
 * @param {Trace[]} traces
 */
export function saveTraces(traces) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(traces.map(serializeTrace)))
}

/**
 * @param {Trace} trace
 */
export function isToday(trace) {
  const date = trace.recordedAt
  const now = new Date()

  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  )
}

/**
 * @param {Date} date
 */
export function toDateInputValue(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/**
 * @param {string} value
 */
export function fromDateInputValue(value) {
  const [y, m, d] = value.split('-').map(Number)
  return new Date(y, m - 1, d, 12, 0, 0)
}
