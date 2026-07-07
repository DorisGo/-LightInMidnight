import { useState } from 'react'
import { TRACE_CATEGORIES, toDateInputValue, fromDateInputValue } from '../../models/trace'
import './AddTraceFlow.css'

function formatNowTime(date) {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

function CategoryIcon({ type }) {
  const props = {
    width: 22,
    height: 22,
    viewBox: '0 0 22 22',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.6,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  }

  switch (type) {
    case 'book':
      return (
        <svg {...props}>
          <path d="M4 4h6v14H5a1 1 0 0 1-1-1V4z" />
          <path d="M12 4h6v13a1 1 0 0 1-1 1h-5V4z" />
        </svg>
      )
    case 'movie':
      return (
        <svg {...props}>
          <rect x="3" y="5" width="16" height="12" rx="1" />
          <path d="M7 5v12M11 5v12M15 5v12" />
        </svg>
      )
    case 'music':
      return (
        <svg {...props}>
          <path d="M9 16a2 2 0 1 1-2-2c0-1.1.9-2 2-2V4l7-2v10" />
          <circle cx="16" cy="14" r="2" />
        </svg>
      )
    case 'place':
      return (
        <svg {...props}>
          <path d="M11 3a5 5 0 0 1 5 5c0 4-5 11-5 11S6 12 6 8a5 5 0 0 1 5-5z" />
          <circle cx="11" cy="8" r="1.5" />
        </svg>
      )
    default:
      return (
        <svg {...props}>
          <circle cx="6" cy="11" r="1.2" fill="currentColor" stroke="none" />
          <circle cx="11" cy="11" r="1.2" fill="currentColor" stroke="none" />
          <circle cx="16" cy="11" r="1.2" fill="currentColor" stroke="none" />
        </svg>
      )
  }
}

const CATEGORY_LABELS = {
  book: 'Book',
  movie: 'Movie',
  music: 'Music',
  place: 'Place',
  other: 'Other',
}

export default function AddTraceFlow({ step, onStepChange, onComplete, onDismiss }) {
  const [capturedAt] = useState(() => new Date())
  const [memory, setMemory] = useState('')
  const [category, setCategory] = useState('book')
  const [dateValue, setDateValue] = useState(() => toDateInputValue(new Date()))
  const [note, setNote] = useState('')

  const canSave = memory.trim().length > 0

  const handleSave = (e) => {
    e.preventDefault()
    if (!canSave) return

    onComplete({
      memory: memory.trim(),
      category,
      occurredAt: fromDateInputValue(dateValue),
      recordedAt: new Date(),
      note: note.trim(),
    })
  }

  if (step === 'pause') {
    return (
      <div className="add-trace-flow add-trace-flow--pause">
        <button
          type="button"
          className="add-trace-flow__dismiss"
          onClick={onDismiss}
          aria-label="返回"
        />

        <div className="add-trace-flow__paper-wrap add-trace-flow__paper-wrap--pause">
          <svg
            className="add-trace-flow__paper-svg"
            viewBox="0 0 320 260"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              className="add-trace-flow__paper-border"
              d="M 14 18
                 C 42 10, 78 22, 118 14
                 S 198 8, 248 16
                 S 292 12, 306 24
                 L 310 58
                 C 314 98, 308 138, 312 178
                 L 306 218
                 C 288 238, 228 232, 168 236
                 S 68 240, 28 228
                 L 12 188
                 C 8 148, 10 108, 14 68
                 Z"
            />
            <path className="add-trace-flow__crease" d="M 36 72 Q 108 98 196 64 T 284 88" />
            <path className="add-trace-flow__crease" d="M 48 148 Q 132 124 210 156 T 296 138" />
            <path className="add-trace-flow__crease" d="M 72 44 L 118 108" />
            <path className="add-trace-flow__crease" d="M 228 52 L 186 118" />
            <path className="add-trace-flow__crease add-trace-flow__crease--fold" d="M 252 24 L 268 48 L 244 56 Z" />
          </svg>

          <div className="add-trace-flow__paper add-trace-flow__paper--pause">
            <div className="add-trace-flow__content">
              <h2 className="add-trace-flow__title">now</h2>
              <p className="add-trace-flow__time">{formatNowTime(capturedAt)}</p>

              <button
                type="button"
                className="add-trace-flow__leave-link"
                onClick={() => onStepChange('entry')}
              >
                Leave a Trace.
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="add-trace-flow add-trace-flow--entry">
      <form className="add-trace-flow__paper add-trace-flow__paper--entry" onSubmit={handleSave}>
        <div className="add-trace-flow__entry-header">
          <button
            type="button"
            className="add-trace-flow__back"
            onClick={() => onStepChange('pause')}
            aria-label="返回"
          >
            ‹
          </button>
          <h2 className="add-trace-flow__entry-title">Leave a Trace.</h2>
        </div>

        <label className="add-trace-flow__field">
          <span className="add-trace-flow__label">What would you like to remember?</span>
          <input
            className="add-trace-flow__input"
            type="text"
            placeholder="e.g. A book, a movie, a song..."
            value={memory}
            onChange={(e) => setMemory(e.target.value)}
            autoFocus
          />
        </label>

        <fieldset className="add-trace-flow__field">
          <legend className="add-trace-flow__label">What was it?</legend>
          <div className="add-trace-flow__categories">
            {TRACE_CATEGORIES.map((type) => (
              <button
                key={type}
                type="button"
                className={`add-trace-flow__category ${category === type ? 'active' : ''}`}
                onClick={() => setCategory(type)}
                aria-label={CATEGORY_LABELS[type]}
              >
                <CategoryIcon type={type} />
                <span>{CATEGORY_LABELS[type]}</span>
              </button>
            ))}
          </div>
        </fieldset>

        <label className="add-trace-flow__field">
          <span className="add-trace-flow__label">When did you meet it?</span>
          <div className="add-trace-flow__date-row">
            <input
              className="add-trace-flow__input add-trace-flow__date"
              type="date"
              value={dateValue}
              onChange={(e) => setDateValue(e.target.value)}
            />
          </div>
        </label>

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
      </form>
    </div>
  )
}
