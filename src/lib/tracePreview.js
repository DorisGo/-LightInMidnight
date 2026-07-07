/**
 * @param {string} [note]
 * @param {number} [maxLength]
 */
export function previewNote(note, maxLength = 10) {
  if (!note) return null
  const trimmed = note.trim()
  if (!trimmed) return null
  if (trimmed.length <= maxLength) return trimmed
  return `${trimmed.slice(0, maxLength)}...`
}

/**
 * @param {import('../models/trace').Trace} trace
 */
export function getTimelineFocusForTrace(trace) {
  return {
    mode: 'month',
    referenceDate: trace.occurredAt,
  }
}
