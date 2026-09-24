import MarkShape from '../MarkShape'
import TraceThumb from '../trace/TraceThumb'
import { CATEGORY_LABELS } from '../../models/trace'
import { useShapePreferences } from '../../context/ShapePreferenceContext'
import { formatTraceDates } from '../../lib/timeline'
import './TimelineItem.css'

/**
 * @typedef {import('../../models/trace').Trace} Trace
 */

/**
 * @param {{ trace: Trace, highlighted?: boolean, onSelect?: (trace: Trace) => void }} props
 */
export default function TimelineItem({ trace, highlighted = false, onSelect }) {
  const { getMarkForTrace } = useShapePreferences()
  const mark = getMarkForTrace(trace)

  return (
    <article
      id={`timeline-trace-${trace.id}`}
      className={`timeline-item ${highlighted ? 'timeline-item--highlighted' : ''} ${onSelect ? 'timeline-item--clickable' : ''}`}
      onClick={onSelect ? () => onSelect(trace) : undefined}
    >
      <div className={`timeline-item__icon ${trace.cover ? 'timeline-item__icon--cover' : ''}`} aria-hidden="true">
        {trace.cover ? <TraceThumb trace={trace} width={32} /> : <MarkShape type={mark} size={22} />}
      </div>
      <div className="timeline-item__body">
        <h3 className="timeline-item__title">{trace.memory}</h3>
        <p className="timeline-item__type">
          {trace.subtitle ? `${CATEGORY_LABELS[trace.category]} · ${trace.subtitle}` : CATEGORY_LABELS[trace.category]}
        </p>
        <time className="timeline-item__date" dateTime={trace.occurredAt.toISOString()}>
          {formatTraceDates(trace)}
        </time>
      </div>
    </article>
  )
}
