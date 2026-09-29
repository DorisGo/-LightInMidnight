import { useEffect, useRef, useState } from 'react'
import CategoryIcon from '../CategoryIcon'
import TraceThumb from '../trace/TraceThumb'
import { searchEverything } from '../../lib/catalog'
import {
  CATEGORY_LABELS,
  SPAN_CATEGORIES,
  toDateInputValue,
  fromDateInputValue,
} from '../../models/trace'
import './QuickAddSheet.css'

/**
 * @typedef {import('../../models/trace').Trace} Trace
 * @typedef {import('../../models/trace').TraceInput} TraceInput
 * @typedef {import('../../models/trace').TraceCategory} TraceCategory
 * @typedef {import('../../models/trace').SpanStatus} SpanStatus
 * @typedef {import('../../lib/catalog').CatalogItem} CatalogItem
 * @typedef {'date'|'duration'|'status'|'category'} ChipName
 */

const WORD_CATEGORIES = /** @type {TraceCategory[]} */ (['place', 'other', 'book', 'movie', 'music'])

const STATUS_LABELS = {
  ongoing: 'Still with it',
  finished: 'Finished today',
  paused: 'Set aside today',
}

/**
 * @param {string} key 'YYYY-MM-DD'
 * @param {boolean} lasting
 */
function dateLabel(key, lasting) {
  const today = toDateInputValue(new Date())
  const yesterday = toDateInputValue(new Date(Date.now() - 86400000))
  const day = key === today
    ? 'today'
    : key === yesterday
      ? 'yesterday'
      : fromDateInputValue(key).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  if (lasting) return `Began ${day}`
  return day[0].toUpperCase() + day.slice(1)
}

/**
 * Enter only takes the top result when it is clearly what was typed —
 * a sentence like "an evening walk by the river" should stay words.
 * @param {CatalogItem} item
 * @param {string} query
 */
function matchesQuery(item, query) {
  const normalize = (/** @type {string} */ text) => text.toLowerCase().replace(/\s+/g, '')
  const title = normalize(item.title)
  const typed = normalize(query)
  return typed.length > 0 && (title.includes(typed) || typed.includes(title))
}

/**
 * @param {{ label: string, open: boolean, onClick: () => void }} props
 */
function Chip({ label, open, onClick }) {
  return (
    <button
      type="button"
      className={`quick-add__chip ${open ? 'open' : ''}`}
      onClick={onClick}
      aria-expanded={open}
    >
      {label}
      <span className="quick-add__chip-caret" aria-hidden="true">⌄</span>
    </button>
  )
}

/**
 * Input first: type what you met, pick it, leave it. Everything else has a sensible default.
 * @param {{
 *   ongoing?: Trace[],
 *   sessionKeys?: Set<string>,
 *   onSession?: (trace: Trace) => void,
 *   onSave: (input: Omit<TraceInput, 'recordedAt'>, from: DOMRect | null) => void,
 *   onClose: () => void,
 * }} props
 */
export default function QuickAddSheet({ ongoing = [], sessionKeys = new Set(), onSession, onSave, onClose }) {
  const today = toDateInputValue(new Date())
  const inputRef = useRef(/** @type {HTMLInputElement|null} */ (null))
  const visualRef = useRef(/** @type {HTMLElement|null} */ (null))

  const [query, setQuery] = useState('')
  const [results, setResults] = useState(/** @type {CatalogItem[]} */ ([]))
  const [searching, setSearching] = useState(false)
  const [picked, setPicked] = useState(/** @type {CatalogItem|null} */ (null))
  const [asWords, setAsWords] = useState(false)
  const [category, setCategory] = useState(/** @type {TraceCategory} */ ('other'))
  const [dateKey, setDateKey] = useState(today)
  const [lasting, setLasting] = useState(false)
  const [status, setStatus] = useState(/** @type {SpanStatus} */ ('ongoing'))
  const [note, setNote] = useState('')
  const [noteOpen, setNoteOpen] = useState(false)
  const [openChip, setOpenChip] = useState(/** @type {ChipName|null} */ (null))
  const [closing, setClosing] = useState(false)

  const chosen = Boolean(picked) || asWords
  const title = picked?.title ?? query.trim()

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    if (chosen || !query.trim()) {
      setResults([])
      setSearching(false)
      return
    }
    const controller = new AbortController()
    setSearching(true)
    const timer = window.setTimeout(async () => {
      try {
        setResults(await searchEverything(query, controller.signal))
      } catch (err) {
        if (err.name !== 'AbortError') setResults([])
      } finally {
        if (!controller.signal.aborted) setSearching(false)
      }
    }, 320)
    return () => {
      window.clearTimeout(timer)
      controller.abort()
    }
  }, [query, chosen])

  const applyCategory = (/** @type {TraceCategory} */ next) => {
    setCategory(next)
    setLasting(SPAN_CATEGORIES.includes(next))
  }

  const pick = (/** @type {CatalogItem} */ item) => {
    setPicked(item)
    setAsWords(false)
    applyCategory(item.category)
    setOpenChip(null)
  }

  const keepAsWords = () => {
    if (!query.trim()) return
    setPicked(null)
    setAsWords(true)
    applyCategory('other')
  }

  const reset = () => {
    setPicked(null)
    setAsWords(false)
    setOpenChip(null)
    window.setTimeout(() => inputRef.current?.focus(), 0)
  }

  const dismiss = () => {
    setClosing(true)
    window.setTimeout(onClose, 220)
  }

  const save = () => {
    if (!title) return
    const occurredAt = fromDateInputValue(dateKey)
    const endedAt = fromDateInputValue(today)
    onSave(
      {
        memory: title,
        category,
        occurredAt,
        note: note.trim(),
        ...(picked
          ? {
              cover: picked.cover,
              subtitle: picked.subtitle,
              source: { provider: 'neodb', id: picked.id, url: picked.url },
            }
          : {}),
        ...(lasting
          ? { span: { status, endedAt: status === 'ongoing' ? null : endedAt < occurredAt ? occurredAt : endedAt } }
          : {}),
      },
      visualRef.current?.getBoundingClientRect() ?? null,
    )
  }

  const handleKey = (/** @type {import('react').KeyboardEvent} */ e) => {
    if (e.key === 'Escape') dismiss()
    // Enter while an IME is composing (pinyin, kana) only confirms the characters.
    if (e.nativeEvent.isComposing || e.keyCode === 229) return
    if (e.key !== 'Enter' || e.target instanceof HTMLTextAreaElement) return
    e.preventDefault()
    if (chosen) save()
    else if (results[0] && matchesQuery(results[0], query)) pick(results[0])
    else keepAsWords()
  }

  const toggleChip = (/** @type {ChipName} */ name) => setOpenChip((open) => (open === name ? null : name))

  return (
    <div className={`quick-add ${closing ? 'quick-add--closing' : ''}`} onKeyDown={handleKey}>
      <button type="button" className="quick-add__backdrop" onClick={dismiss} aria-label="Close" />

      <div className="quick-add__sheet" role="dialog" aria-label="Leave a trace">
        <span className="quick-add__handle" aria-hidden="true" />

        {!chosen ? (
          <label className="quick-add__ask">
            <span className="quick-add__prompt">What did you meet?</span>
            <input
              ref={inputRef}
              className="quick-add__input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="A book, a film, a song, a walk…"
              autoComplete="off"
              enterKeyHint="go"
            />
          </label>
        ) : (
          <div className="quick-add__chosen">
            <div className="quick-add__visual" ref={(el) => { visualRef.current = el }}>
              {picked ? (
                <img src={picked.cover} alt="" />
              ) : (
                <span className="quick-add__words-card">
                  <CategoryIcon type={category} />
                </span>
              )}
            </div>
            <div className="quick-add__chosen-text">
              <p className="quick-add__chosen-title">{title}</p>
              {picked?.subtitle && <p className="quick-add__chosen-subtitle">{picked.subtitle}</p>}
              <button type="button" className="quick-add__change" onClick={reset}>
                Not this one
              </button>
            </div>
          </div>
        )}

        {!chosen && !query.trim() && ongoing.length > 0 && (
          <section className="quick-add__ongoing">
            <p className="quick-add__section-label">Still with you — tap if you were today</p>
            <div className="quick-add__ongoing-row">
              {ongoing.map((trace) => {
                const marked = sessionKeys.has(trace.id)
                return (
                  <button
                    key={trace.id}
                    type="button"
                    className={`quick-add__ongoing-item ${marked ? 'marked' : ''}`}
                    onClick={() => onSession?.(trace)}
                    aria-pressed={marked}
                  >
                    <TraceThumb trace={trace} width={44} />
                    <span>{marked ? 'Today ✓' : trace.memory}</span>
                  </button>
                )
              })}
            </div>
          </section>
        )}

        {!chosen && query.trim() && (
          <div className="quick-add__results">
            {results.map((item) => (
              <button key={item.id} type="button" className="quick-add__result" onClick={() => pick(item)}>
                <img src={item.cover} alt="" loading="lazy" />
                <span className="quick-add__result-text">
                  <span className="quick-add__result-title">{item.title}</span>
                  {item.subtitle && <span className="quick-add__result-subtitle">{item.subtitle}</span>}
                </span>
                <span className="quick-add__result-kind">{CATEGORY_LABELS[item.category]}</span>
              </button>
            ))}
            {searching && results.length === 0 && <p className="quick-add__hint">Looking…</p>}
            <button type="button" className="quick-add__as-words" onClick={keepAsWords}>
              <span className="quick-add__as-words-quote">“{query.trim()}”</span>
              <span>just as it is</span>
            </button>
          </div>
        )}

        {chosen && (
          <>
            <div className="quick-add__chips">
              {asWords && (
                <Chip label={CATEGORY_LABELS[category]} open={openChip === 'category'} onClick={() => toggleChip('category')} />
              )}
              <Chip label={dateLabel(dateKey, lasting)} open={openChip === 'date'} onClick={() => toggleChip('date')} />
              <Chip label={lasting ? 'A while' : 'A single day'} open={openChip === 'duration'} onClick={() => toggleChip('duration')} />
              {lasting && (
                <Chip label={STATUS_LABELS[status]} open={openChip === 'status'} onClick={() => toggleChip('status')} />
              )}
              {!noteOpen && (
                <button type="button" className="quick-add__chip quick-add__chip--ghost" onClick={() => setNoteOpen(true)}>
                  + a line
                </button>
              )}
            </div>

            {openChip && (
              <div className="quick-add__options">
                {openChip === 'category' && WORD_CATEGORIES.map((value) => (
                  <button
                    key={value}
                    type="button"
                    className={`quick-add__option ${category === value ? 'active' : ''}`}
                    onClick={() => { applyCategory(value); setOpenChip(null) }}
                  >
                    {CATEGORY_LABELS[value]}
                  </button>
                ))}
                {openChip === 'date' && (
                  <>
                    {[
                      [today, 'Today'],
                      [toDateInputValue(new Date(Date.now() - 86400000)), 'Yesterday'],
                    ].map(([value, label]) => (
                      <button
                        key={value}
                        type="button"
                        className={`quick-add__option ${dateKey === value ? 'active' : ''}`}
                        onClick={() => { setDateKey(value); setOpenChip(null) }}
                      >
                        {label}
                      </button>
                    ))}
                    <label className="quick-add__option quick-add__option--date">
                      Another day…
                      <input
                        type="date"
                        max={today}
                        value={dateKey}
                        onChange={(e) => { if (e.target.value) setDateKey(e.target.value); setOpenChip(null) }}
                        onClick={(e) => e.currentTarget.showPicker?.()}
                      />
                    </label>
                  </>
                )}
                {openChip === 'duration' && [[false, 'A single day'], [true, 'A while']].map(([value, label]) => (
                  <button
                    key={label}
                    type="button"
                    className={`quick-add__option ${lasting === value ? 'active' : ''}`}
                    onClick={() => { setLasting(value); setOpenChip(null) }}
                  >
                    {label}
                  </button>
                ))}
                {openChip === 'status' && /** @type {SpanStatus[]} */ (['ongoing', 'finished', 'paused']).map((value) => (
                  <button
                    key={value}
                    type="button"
                    className={`quick-add__option ${status === value ? 'active' : ''}`}
                    onClick={() => { setStatus(value); setOpenChip(null) }}
                  >
                    {STATUS_LABELS[value]}
                  </button>
                ))}
              </div>
            )}

            {noteOpen && (
              <textarea
                className="quick-add__note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Anything you want to keep with it…"
                rows={2}
                autoFocus
              />
            )}

            <button type="button" className="quick-add__save" onClick={save}>
              Leave a trace
            </button>
          </>
        )}
      </div>
    </div>
  )
}
