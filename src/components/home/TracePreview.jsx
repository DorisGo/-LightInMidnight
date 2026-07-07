import { useNavigate } from 'react-router-dom'
import MarkShape from '../MarkShape'
import { useShapePreferences } from '../../context/ShapePreferenceContext'
import { previewNote } from '../../lib/tracePreview'
import '../home/AddTraceFlow.css'
import './TracePreview.css'

/**
 * @typedef {import('../../models/trace').Trace} Trace
 */

function formatRecordedTime(date) {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

/**
 * @param {{ trace: Trace, onClose: () => void }} props
 */
export default function TracePreview({ trace, onClose }) {
  const navigate = useNavigate()
  const { getMarkForTrace } = useShapePreferences()
  const mark = getMarkForTrace(trace)
  const notePreview = previewNote(trace.note)

  return (
    <div className="trace-preview">
      <button
        type="button"
        className="trace-preview__backdrop"
        onClick={onClose}
        aria-label="关闭"
      />

      <div
        className="add-trace-flow__paper-wrap add-trace-flow__paper-wrap--pause trace-preview__wrap"
        role="dialog"
        aria-label={trace.memory}
      >
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

        <div className="add-trace-flow__paper add-trace-flow__paper--pause trace-preview__paper">
          <div className="trace-preview__mark" aria-hidden="true">
            <MarkShape type={mark} size={34} />
          </div>

          <div className="add-trace-flow__content trace-preview__content">
            <h2 className="trace-preview__title">{trace.memory}</h2>
            <time
              className="add-trace-flow__time trace-preview__time"
              dateTime={trace.recordedAt.toISOString()}
            >
              {formatRecordedTime(trace.recordedAt)}
            </time>

            {notePreview && (
              <p className="trace-preview__note">{notePreview}</p>
            )}

            <div className="trace-preview__actions">
              <button
                type="button"
                className="trace-preview__link"
                onClick={() => navigate(`/trace/${trace.id}/edit`)}
              >
                Expand
              </button>
              <span className="trace-preview__dot" aria-hidden="true">·</span>
              <button
                type="button"
                className="trace-preview__link"
                onClick={() => navigate(`/timeline?trace=${trace.id}`)}
              >
                Timeline
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
