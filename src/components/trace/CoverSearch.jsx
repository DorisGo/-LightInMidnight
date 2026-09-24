import { useEffect, useState } from 'react'
import { searchCatalog, isSearchable } from '../../lib/catalog'
import './CoverSearch.css'

/**
 * @typedef {import('../../lib/catalog').CatalogItem} CatalogItem
 * @typedef {import('../../models/trace').TraceCategory} TraceCategory
 */

/**
 * Suggestions shown under the title input while the person types.
 * @param {{
 *   query: string,
 *   category: TraceCategory,
 *   hidden: boolean,
 *   onPick: (item: CatalogItem) => void,
 * }} props
 */
export default function CoverSearch({ query, category, hidden, onPick }) {
  const [results, setResults] = useState(/** @type {CatalogItem[]} */ ([]))
  const [state, setState] = useState(/** @type {'idle'|'loading'|'done'|'error'} */ ('idle'))

  const active = !hidden && isSearchable(category) && query.trim().length > 0

  useEffect(() => {
    if (!active) {
      setResults([])
      setState('idle')
      return
    }

    const controller = new AbortController()
    const timer = window.setTimeout(async () => {
      setState('loading')
      try {
        const items = await searchCatalog(query, category, controller.signal)
        setResults(items)
        setState('done')
      } catch (err) {
        if (err.name !== 'AbortError') setState('error')
      }
    }, 350)

    return () => {
      window.clearTimeout(timer)
      controller.abort()
    }
  }, [active, query, category])

  if (!active || state === 'idle') return null

  return (
    <div className="cover-search" role="listbox" aria-label="Suggestions">
      {state === 'loading' && results.length === 0 && (
        <p className="cover-search__hint">Looking…</p>
      )}
      {state === 'error' && (
        <p className="cover-search__hint">Couldn't reach the catalog. You can still save it by name.</p>
      )}
      {state === 'done' && results.length === 0 && (
        <p className="cover-search__hint">Nothing found. It can still be a trace.</p>
      )}
      {results.map((item) => (
        <button
          key={item.id}
          type="button"
          role="option"
          aria-selected="false"
          className="cover-search__item"
          onClick={() => onPick(item)}
        >
          <img className="cover-search__cover" src={item.cover} alt="" loading="lazy" />
          <span className="cover-search__text">
            <span className="cover-search__title">{item.title}</span>
            {item.subtitle && <span className="cover-search__subtitle">{item.subtitle}</span>}
          </span>
        </button>
      ))}
    </div>
  )
}
