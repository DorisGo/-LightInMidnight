/**
 * Look up books, films and music so a trace can carry its cover.
 * Backed by NeoDB (https://neodb.social) — open, keyless, and good with Chinese titles.
 */

/**
 * @typedef {import('../models/trace').TraceCategory} TraceCategory
 */

/**
 * @typedef {Object} CatalogItem
 * @property {string} id
 * @property {string} title
 * @property {string} subtitle
 * @property {string} cover
 * @property {string} url
 * @property {string} kind  NeoDB category, e.g. 'movie' or 'tv'
 * @property {TraceCategory} category  what it becomes as a trace
 */

const API = 'https://neodb.social/api/catalog/search'

/** @type {Partial<Record<TraceCategory, string[]>>} */
const NEODB_CATEGORIES = {
  book: ['book'],
  movie: ['movie', 'tv'],
  music: ['music'],
}

/** @type {Record<string, TraceCategory>} */
const KIND_TO_CATEGORY = {
  book: 'book',
  movie: 'movie',
  tv: 'movie',
  music: 'music',
}

const CJK = /[㐀-鿿]/

/**
 * @param {TraceCategory} category
 */
export function isSearchable(category) {
  return Boolean(NEODB_CATEGORIES[category])
}

/**
 * Prefer the Chinese title when the person searched in Chinese.
 * @param {Record<string, any>} item
 * @param {string} query
 */
function pickTitle(item, query) {
  if (CJK.test(query) && Array.isArray(item.localized_title)) {
    const zh = item.localized_title.find((t) => t.lang === 'zh-cn' || t.lang === 'zh-hans')
    if (zh?.text) return zh.text
  }
  return item.display_title || item.title || ''
}

/**
 * @param {Record<string, any>} item
 */
function pickSubtitle(item) {
  const people = item.author ?? item.director ?? item.artist ?? []
  const year = item.pub_year ?? item.year ?? item.release_date?.slice(0, 4)
  return [people.slice(0, 2).join(' / '), year].filter(Boolean).join(' · ')
}

/**
 * @param {string} query
 * @param {TraceCategory} category
 * @param {AbortSignal} [signal]
 * @returns {Promise<CatalogItem[]>}
 */
export async function searchCatalog(query, category, signal) {
  const kinds = NEODB_CATEGORIES[category]
  const trimmed = query.trim()
  if (!kinds || trimmed.length < 1) return []

  const pages = await Promise.all(
    kinds.map(async (kind) => {
      const params = new URLSearchParams({ query: trimmed, category: kind, page: '1' })
      const res = await fetch(`${API}?${params}`, { signal })
      if (!res.ok) return []
      const json = await res.json()
      return Array.isArray(json.data) ? json.data : []
    }),
  )

  // Interleave films and series so neither crowds the other out.
  const merged = []
  for (let i = 0; merged.length < 16 && pages.some((page) => i < page.length); i++) {
    for (const page of pages) if (page[i]) merged.push(page[i])
  }

  return toCatalogItems(merged, trimmed).slice(0, 8)
}

/**
 * @param {Record<string, any>[]} raw
 * @param {string} query
 * @returns {CatalogItem[]}
 */
function toCatalogItems(raw, query) {
  return raw
    // Seasons are titled just "Season 1"; the show itself reads better.
    .filter((item) => item.type !== 'TVSeason')
    .filter((item) => KIND_TO_CATEGORY[item.category])
    .filter((item) => item.cover_image_url && !item.cover_image_url.includes('default'))
    .map((item) => ({
      id: item.uuid,
      title: pickTitle(item, query),
      subtitle: pickSubtitle(item),
      cover: item.cover_image_url,
      url: item.id,
      kind: item.category,
      category: KIND_TO_CATEGORY[item.category],
    }))
}

/**
 * Search books, films, series and music at once, so the person never has to pick a category first.
 * @param {string} query
 * @param {AbortSignal} [signal]
 * @returns {Promise<CatalogItem[]>}
 */
export async function searchEverything(query, signal) {
  const trimmed = query.trim()
  if (!trimmed) return []

  const params = new URLSearchParams({ query: trimmed, page: '1' })
  const res = await fetch(`${API}?${params}`, { signal })
  if (!res.ok) return []
  const json = await res.json()
  return toCatalogItems(Array.isArray(json.data) ? json.data : [], trimmed).slice(0, 6)
}
