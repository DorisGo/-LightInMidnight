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
 * @typedef {Object} TraceInput
 * @property {string} memory
 * @property {TraceCategory} category
 * @property {Date} occurredAt
 * @property {string} [note]
 */

/**
 * One encounter between a person and the world.
 * @typedef {Object} Trace
 * @property {string} id
 * @property {Date} occurredAt
 * @property {MarkType} mark
 * @property {CanvasPlacement} placement
 * @property {string} memory
 * @property {TraceCategory} category
 * @property {string} [note]
 */

export const MARK_TYPES = ['star', 'triangle', 'square', 'diamond', 'target', 'dots', 'squiggle']

export const TRACE_CATEGORIES = ['book', 'movie', 'music', 'place', 'other']

const LEGACY_STORAGE_KEY = 'light-in-midnight-events'
export const STORAGE_KEY = 'light-in-midnight-traces'

function randomMark() {
  return MARK_TYPES[Math.floor(Math.random() * MARK_TYPES.length)]
}

export function randomPlacement() {
  return {
    x: 8 + Math.random() * 74,
    y: 12 + Math.random() * 58,
    rotation: -30 + Math.random() * 60,
    scale: 0.75 + Math.random() * 0.5,
  }
}

/**
 * @param {TraceInput} input
 * @returns {Trace}
 */
export function createTrace(input) {
  return {
    id: crypto.randomUUID(),
    occurredAt: input.occurredAt,
    mark: randomMark(),
    placement: randomPlacement(),
    memory: input.memory,
    category: input.category,
    ...(input.note ? { note: input.note } : {}),
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
  const mark = record.mark ?? record.symbol
  const placement = record.placement ?? record.position

  if (typeof id !== 'string' || !occurredAtRaw || !mark || !placement) return null

  /** @type {Trace} */
  const trace = {
    id,
    occurredAt: new Date(/** @type {string|number|Date} */ (occurredAtRaw)),
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

  return trace
}

/**
 * @param {Trace} trace
 */
export function serializeTrace(trace) {
  return {
    id: trace.id,
    occurredAt: trace.occurredAt.toISOString(),
    mark: trace.mark,
    placement: trace.placement,
    memory: trace.memory,
    category: trace.category,
    ...(trace.note ? { note: trace.note } : {}),
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
  const date = trace.occurredAt
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
