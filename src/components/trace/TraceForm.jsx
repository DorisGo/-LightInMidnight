import { useState } from 'react'
import CategoryIcon from '../CategoryIcon'
import CoverSearch from './CoverSearch'
import {
  TRACE_CATEGORIES,
  CATEGORY_LABELS,
  SPAN_CATEGORIES,
  SPAN_STATUS_LABELS,
  toDateInputValue,
  fromDateInputValue,
} from '../../models/trace'
import '../home/AddTraceFlow.css'
import './TraceForm.css'

/**
 * @typedef {import('../../models/trace').Trace} Trace
 * @typedef {import('../../models/trace').TraceInput} TraceInput
 * @typedef {import('../../models/trace').TraceCategory} TraceCategory
 * @typedef {import('../../models/trace').SpanStatus} SpanStatus
 * @typedef {import('../../lib/catalog').CatalogItem} CatalogItem
 */

const STATUSES = /** @type {SpanStatus[]} */ (['ongoing', 'finished', 'paused'])

/**
 * The fields behind both "Leave a Trace" and "Edit Trace".
 * @param {{
 *   heading: string,
 *   initial?: Trace,
 *   onBack: () => void,
 *   onSubmit: (input: Omit<TraceInput, 'recordedAt'>) => void,
 *   className?: string,
 *   children?: import('react').ReactNode,
 * }} props
 */
export default function TraceForm({ heading, initial, onBack, onSubmit, className = '', children }) {
  const today = toDateInputValue(new Date())

  const [memory, setMemory] = useState(initial?.memory ?? '')
  const [category, setCategory] = useState(/** @type {TraceCategory} */ (initial?.category ?? 'book'))
  const [picked, setPicked] = useState(() =>
    initial?.cover
      ? { title: initial.memory, cover: initial.cover, subtitle: initial.subtitle ?? '', source: initial.source }
      : null,
  )
  // Once the person picks a duration themselves, switching category stops overriding it.
  const [spanChosen, setSpanChosen] = useState(Boolean(initial))
  const [lasting, setLasting] = useState(() =>
    initial ? Boolean(initial.span) : SPAN_CATEGORIES.includes(category),
  )
  const [startValue, setStartValue] = useState(() =>
    initial ? toDateInputValue(initial.occurredAt) : today,
  )
  const [status, setStatus] = useState(/** @type {SpanStatus} */ (initial?.span?.status ?? 'ongoing'))
  const [endValue, setEndValue] = useState(() =>
    initial?.span?.endedAt ? toDateInputValue(initial.span.endedAt) : today,
  )
  const [note, setNote] = useState(initial?.note ?? '')

  const needsEnd = lasting && status !== 'ongoing'
  const endBeforeStart = needsEnd && endValue < startValue
  const canSave = memory.trim().length > 0 && !endBeforeStart

  const handleCategory = (/** @type {TraceCategory} */ next) => {
    setCategory(next)
    if (next !== category) setPicked(null)
    if (!spanChosen) setLasting(SPAN_CATEGORIES.includes(next))
  }

  const handleLasting = (/** @type {boolean} */ next) => {
    setSpanChosen(true)
    setLasting(next)
  }

  const handlePick = (/** @type {CatalogItem} */ item) => {
    setMemory(item.title)
    setPicked({
      title: item.title,
      cover: item.cover,
      subtitle: item.subtitle,
      source: { provider: 'neodb', id: item.id, url: item.url },
    })
  }

  const handleMemory = (/** @type {string} */ value) => {
    setMemory(value)
    if (picked && value !== picked.title) setPicked(null)
  }

  const handleSubmit = (/** @type {import('react').FormEvent} */ e) => {
    e.preventDefault()
    if (!canSave) return

    onSubmit({
      memory: memory.trim(),
      category,
      occurredAt: fromDateInputValue(startValue),
      note: note.trim(),
      ...(picked ? { cover: picked.cover, subtitle: picked.subtitle, source: picked.source } : {}),
      ...(lasting
        ? { span: { status, endedAt: needsEnd ? fromDateInputValue(endValue) : null } }
        : {}),
    })
  }

  return (
    <form
      className={`add-trace-flow__paper add-trace-flow__paper--entry ${className}`}
      onSubmit={handleSubmit}
    >
      <div className="add-trace-flow__entry-header">
        <button type="button" className="add-trace-flow__back" onClick={onBack} aria-label="返回">
          ‹
        </button>
        <h2 className="add-trace-flow__entry-title">{heading}</h2>
      </div>

      <fieldset className="add-trace-flow__field">
        <legend className="add-trace-flow__label">What was it?</legend>
        <div className="add-trace-flow__categories">
          {TRACE_CATEGORIES.map((type) => (
            <button
              key={type}
              type="button"
              className={`add-trace-flow__category ${category === type ? 'active' : ''}`}
              onClick={() => handleCategory(type)}
              aria-label={CATEGORY_LABELS[type]}
            >
              <CategoryIcon type={type} />
              <span>{CATEGORY_LABELS[type]}</span>
            </button>
          ))}
        </div>
      </fieldset>

      <div className="add-trace-flow__field">
        <label className="add-trace-flow__label" htmlFor="trace-memory">
          What would you like to remember?
        </label>
        <div className="trace-form__title-row">
          {picked && (
            <img className="trace-form__cover" src={picked.cover} alt="" />
          )}
          <input
            id="trace-memory"
            className="add-trace-flow__input"
            type="text"
            placeholder="e.g. A book, a movie, a song..."
            value={memory}
            onChange={(e) => handleMemory(e.target.value)}
            autoComplete="off"
            autoFocus={!initial}
          />
        </div>
        {picked?.subtitle && <p className="trace-form__subtitle">{picked.subtitle}</p>}
        <CoverSearch
          query={memory}
          category={category}
          hidden={Boolean(picked)}
          onPick={handlePick}
        />
      </div>

      <fieldset className="add-trace-flow__field">
        <legend className="add-trace-flow__label">How long were you together?</legend>
        <div className="trace-form__choices">
          <button
            type="button"
            className={`trace-form__choice ${!lasting ? 'active' : ''}`}
            onClick={() => handleLasting(false)}
          >
            A single day
          </button>
          <button
            type="button"
            className={`trace-form__choice ${lasting ? 'active' : ''}`}
            onClick={() => handleLasting(true)}
          >
            A while
          </button>
        </div>
      </fieldset>

      <label className="add-trace-flow__field">
        <span className="add-trace-flow__label">
          {lasting ? 'When did it begin?' : 'When did you meet it?'}
        </span>
        <input
          className="add-trace-flow__input add-trace-flow__date"
          type="date"
          value={startValue}
          onChange={(e) => setStartValue(e.target.value)}
        />
      </label>

      {lasting && (
        <fieldset className="add-trace-flow__field">
          <legend className="add-trace-flow__label">Where are you with it now?</legend>
          <div className="trace-form__choices">
            {STATUSES.map((value) => (
              <button
                key={value}
                type="button"
                className={`trace-form__choice ${status === value ? 'active' : ''}`}
                onClick={() => setStatus(value)}
              >
                {SPAN_STATUS_LABELS[value]}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      {needsEnd && (
        <label className="add-trace-flow__field">
          <span className="add-trace-flow__label">
            {status === 'finished' ? 'When did it end?' : 'When did you set it down?'}
          </span>
          <input
            className="add-trace-flow__input add-trace-flow__date"
            type="date"
            value={endValue}
            min={startValue}
            onChange={(e) => setEndValue(e.target.value)}
          />
          {endBeforeStart && (
            <span className="trace-form__error">It can't end before it began.</span>
          )}
        </label>
      )}

      <label className="add-trace-flow__field">
        <span className="add-trace-flow__label">Would you like to leave a note?</span>
        <textarea
          className="add-trace-flow__textarea"
          placeholder="Write something..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
        />
      </label>

      <button type="submit" className="add-trace-flow__save" disabled={!canSave}>
        Save
      </button>

      {children}
    </form>
  )
}
