import MarkShape from '../MarkShape'
import { CATEGORY_LABELS } from '../../models/trace'
import { useShapePreferences } from '../../context/ShapePreferenceContext'
import { formatEncounterDate } from '../../lib/timeline'
import './TimelineItem.css'

/**
 * @typedef {import('../../models/trace').Trace} Trace
 */

/**
 * @param {{ trace: Trace, highlighted?: boolean }} props
 */
export default function TimelineItem({ trace, highlighted = false }) {
  const { getMarkForTrace } = useShapePreferences()
  const mark = getMarkForTrace(trace)

  return (
    <article
      id={`timeline-trace-${trace.id}`}
      className={`timeline-item ${highlighted ? 'timeline-item--highlighted' : ''}`}
    >
      <div className="timeline-item__icon" aria-hidden="true">
        <MarkShape type={mark} size={22} />
      </div>
      <div className="timeline-item__body">
        <h3 className="timeline-item__title">{trace.memory}</h3>
        <p className="timeline-item__type">{CATEGORY_LABELS[trace.category]}</p>
        <time className="timeline-item__date" dateTime={trace.occurredAt.toISOString()}>
          {formatEncounterDate(trace.occurredAt)}
        </time>
      </div>
    </article>
  )
}
