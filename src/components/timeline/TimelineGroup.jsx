import TimelineItem from './TimelineItem'
import './TimelineGroup.css'

/**
 * @typedef {import('../../models/trace').Trace} Trace
 */

/**
 * @param {{ label: string, traces: Trace[], highlightId?: string | null }} props
 */
export default function TimelineGroup({ label, traces, highlightId = null }) {
  if (traces.length === 0) return null

  return (
    <section className="timeline-group">
      <h2 className="timeline-group__label">{label}</h2>
      <div className="timeline-group__items">
        {traces.map((trace) => (
          <TimelineItem
            key={trace.id}
            trace={trace}
            highlighted={trace.id === highlightId}
          />
        ))}
      </div>
    </section>
  )
}
