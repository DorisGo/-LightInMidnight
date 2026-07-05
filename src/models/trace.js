/**
 * @typedef {'star'|'triangle'|'square'|'diamond'|'target'|'dots'|'squiggle'} MarkType
 */

/**
 * @typedef {Object} CanvasPlacement
 * @property {number} x
 * @property {number} y
 * @property {number} rotation
 * @property {number} scale
 */

/**
 * One encounter between a person and the world.
 * @typedef {Object} Trace
 * @property {string} id
 * @property {Date} occurredAt
 * @property {MarkType} mark
 * @property {CanvasPlacement} placement
 * @property {string} [note]
 */

export const MARK_TYPES = ['star', 'triangle', 'square', 'diamond', 'target', 'dots', 'squiggle']

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
 * @param {string} [note]
 * @returns {Trace}
 */
export function createTrace(note = '') {
  /** @type {Trace} */
  const trace = {
    id: crypto.randomUUID(),
    occurredAt: new Date(),
    mark: randomMark(),
    placement: randomPlacement(),
  }

  if (note) trace.note = note

  return trace
}

/**
 * Accepts current and legacy localStorage shapes.
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
