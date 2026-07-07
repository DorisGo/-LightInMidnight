import { useNavigate, useParams } from 'react-router-dom'
import { useState } from 'react'
import {
  TRACE_CATEGORIES,
  CATEGORY_LABELS,
  toDateInputValue,
  fromDateInputValue,
} from '../models/trace'
import { useTraces } from '../context/TraceContext'
import '../components/home/AddTraceFlow.css'
import './EditTracePage.css'

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

export default function EditTracePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { traces, updateTrace, deleteTrace } = useTraces()
  const trace = traces.find((item) => item.id === id)

  const [memory, setMemory] = useState(trace?.memory ?? '')
  const [category, setCategory] = useState(trace?.category ?? 'book')
  const [dateValue, setDateValue] = useState(() =>
    trace ? toDateInputValue(trace.occurredAt) : toDateInputValue(new Date()),
  )
  const [note, setNote] = useState(trace?.note ?? '')

  if (!trace) {
    return (
      <div className="edit-trace-page">
        <p className="edit-trace-page__missing">Trace not found.</p>
        <button type="button" className="edit-trace-page__link" onClick={() => navigate('/')}>
          Back to home
        </button>
      </div>
    )
  }

  const canSave = memory.trim().length > 0

  const handleSave = (e) => {
    e.preventDefault()
    if (!canSave) return

    updateTrace(trace.id, {
      memory: memory.trim(),
      category,
      occurredAt: fromDateInputValue(dateValue),
      note: note.trim(),
    })
    navigate(-1)
  }

  const handleDelete = () => {
    deleteTrace(trace.id)
    navigate('/')
  }

  return (
    <div className="edit-trace-page">
      <form className="add-trace-flow__paper add-trace-flow__paper--entry edit-trace-page__form" onSubmit={handleSave}>
        <div className="add-trace-flow__entry-header">
          <button
            type="button"
            className="add-trace-flow__back"
            onClick={() => navigate(-1)}
            aria-label="返回"
          >
            ‹
          </button>
          <h2 className="add-trace-flow__entry-title">Edit Trace</h2>
        </div>

        <label className="add-trace-flow__field">
          <span className="add-trace-flow__label">What would you like to remember?</span>
          <input
            className="add-trace-flow__input"
            type="text"
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

        <button type="button" className="edit-trace-page__delete" onClick={handleDelete}>
          Delete trace
        </button>
      </form>
    </div>
  )
}
