/**
 * @typedef {import('./trace').TraceCategory} TraceCategory
 * @typedef {'circle'|'square'|'triangle'|'diamond'|'star'|'hexagon'} MarkShapeType
 * @typedef {'circle'|'square'|'triangle'|'diamond'|'star'|'hexagon'|'random'} ShapePreference
 * @typedef {Record<TraceCategory, ShapePreference>} ShapePreferenceMap
 */

export const SHAPE_PREFERENCE_STORAGE_KEY = 'light-in-midnight-shape-preferences'

export const SHAPE_PREFERENCE_OPTIONS = [
  'circle',
  'square',
  'triangle',
  'diamond',
  'star',
  'hexagon',
  'random',
]

/** @type {Record<ShapePreference, string>} */
export const SHAPE_LABELS = {
  circle: 'Circle',
  square: 'Square',
  triangle: 'Triangle',
  diamond: 'Diamond',
  star: 'Star',
  hexagon: 'Hexagon',
  random: 'Random',
}

/** @type {ShapePreferenceMap} */
export const DEFAULT_SHAPE_PREFERENCES = {
  book: 'square',
  movie: 'circle',
  music: 'triangle',
  place: 'diamond',
  other: 'star',
}

const RANDOM_POOL = ['circle', 'square', 'triangle', 'diamond', 'star', 'hexagon']

/**
 * @param {string} seed
 */
function hashSeed(seed) {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

/**
 * @param {ShapePreference} preference
 * @param {string} [seed]
 * @returns {MarkShapeType}
 */
export function resolveShapePreference(preference, seed = '') {
  if (preference === 'random') {
    return RANDOM_POOL[hashSeed(seed) % RANDOM_POOL.length]
  }
  return preference
}

/**
 * @param {import('./trace').Trace} trace
 * @param {ShapePreferenceMap} preferences
 * @returns {MarkShapeType}
 */
export function getMarkForTrace(trace, preferences) {
  const preference = preferences[trace.category] ?? DEFAULT_SHAPE_PREFERENCES[trace.category]
  return resolveShapePreference(preference, trace.id)
}

/**
 * @param {unknown} raw
 * @returns {ShapePreferenceMap}
 */
export function parseShapePreferences(raw) {
  if (!raw || typeof raw !== 'object') {
    return { ...DEFAULT_SHAPE_PREFERENCES }
  }

  /** @type {ShapePreferenceMap} */
  const next = { ...DEFAULT_SHAPE_PREFERENCES }
  const record = /** @type {Record<string, unknown>} */ (raw)

  for (const category of Object.keys(DEFAULT_SHAPE_PREFERENCES)) {
    const value = record[category]
    if (SHAPE_PREFERENCE_OPTIONS.includes(/** @type {string} */ (value))) {
      next[/** @type {TraceCategory} */ (category)] = /** @type {ShapePreference} */ (value)
    }
  }

  return next
}

/**
 * @returns {ShapePreferenceMap}
 */
export function loadShapePreferences() {
  try {
    const raw = localStorage.getItem(SHAPE_PREFERENCE_STORAGE_KEY)
    if (!raw) return { ...DEFAULT_SHAPE_PREFERENCES }
    return parseShapePreferences(JSON.parse(raw))
  } catch {
    return { ...DEFAULT_SHAPE_PREFERENCES }
  }
}

/**
 * @param {ShapePreferenceMap} preferences
 */
export function saveShapePreferences(preferences) {
  localStorage.setItem(SHAPE_PREFERENCE_STORAGE_KEY, JSON.stringify(preferences))
}

/**
 * @param {TraceCategory} category
 * @param {ShapePreferenceMap} preferences
 * @returns {MarkShapeType}
 */
export function getPreviewMarkForCategory(category, preferences) {
  const preference = preferences[category] ?? DEFAULT_SHAPE_PREFERENCES[category]
  return resolveShapePreference(preference, category)
}
