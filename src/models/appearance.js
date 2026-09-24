/**
 * @typedef {'candle'|'indigo'|'amber'} Palette
 * @typedef {'paper'|'night'} Mode
 * @typedef {'glow'|'atlas'} Sky
 * @typedef {{ palette: Palette, mode: Mode, sky: Sky }} Appearance
 */

export const APPEARANCE_STORAGE_KEY = 'light-in-midnight-appearance'

/** @type {Appearance} */
export const DEFAULT_APPEARANCE = { palette: 'candle', mode: 'paper', sky: 'glow' }

export const PALETTE_OPTIONS = /** @type {{ value: Palette, label: string, hint: string, swatches: string[] }[]} */ ([
  { value: 'candle', label: 'Candle', hint: 'Indigo ink, with a little warm light', swatches: ['#f6f2e9', '#3f3d89', '#f2b457'] },
  { value: 'indigo', label: 'Indigo', hint: 'One ink, all the way through', swatches: ['#f5f5f0', '#3f3d89', '#15143a'] },
  { value: 'amber', label: 'Amber', hint: 'Old paper and a desk lamp', swatches: ['#f4ede0', '#5b3a1f', '#f0a640'] },
])

export const MODE_OPTIONS = /** @type {{ value: Mode, label: string }[]} */ ([
  { value: 'paper', label: 'Paper' },
  { value: 'night', label: 'Night' },
])

export const SKY_OPTIONS = /** @type {{ value: Sky, label: string }[]} */ ([
  { value: 'glow', label: 'Glowing sky' },
  { value: 'atlas', label: 'Ink star atlas' },
])

/**
 * @param {unknown} raw
 * @returns {Appearance}
 */
export function parseAppearance(raw) {
  if (!raw || typeof raw !== 'object') return { ...DEFAULT_APPEARANCE }
  const record = /** @type {Record<string, unknown>} */ (raw)
  const pick = (/** @type {string} */ key, /** @type {{ value: string }[]} */ options) =>
    options.some((option) => option.value === record[key]) ? record[key] : DEFAULT_APPEARANCE[key]

  return /** @type {Appearance} */ ({
    palette: pick('palette', PALETTE_OPTIONS),
    mode: pick('mode', MODE_OPTIONS),
    sky: pick('sky', SKY_OPTIONS),
  })
}

/**
 * @returns {Appearance}
 */
export function loadAppearance() {
  try {
    const raw = localStorage.getItem(APPEARANCE_STORAGE_KEY)
    return raw ? parseAppearance(JSON.parse(raw)) : { ...DEFAULT_APPEARANCE }
  } catch {
    return { ...DEFAULT_APPEARANCE }
  }
}

/**
 * @param {Appearance} appearance
 */
export function saveAppearance(appearance) {
  try {
    localStorage.setItem(APPEARANCE_STORAGE_KEY, JSON.stringify(appearance))
  } catch {
    // Storage can be unavailable (private mode); the choice just won't persist.
  }
}
