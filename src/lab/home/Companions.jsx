import TraceThumb from '../../components/trace/TraceThumb'
import './Companions.css'

/**
 * @typedef {import('../../models/trace').Trace} Trace
 */

/**
 * Covers of what is still keeping you company, drifting gently.
 * Tapping one says "you were with it today".
 * @param {{
 *   traces: Trace[],
 *   marked: Set<string>,
 *   onToggle: (trace: Trace) => void,
 *   layout?: 'row' | 'scatter',
 *   positions?: { x: number, y: number, rotation: number }[],
 *   width?: number,
 * }} props
 */
export default function Companions({ traces, marked, onToggle, layout = 'row', positions = [], width = 46 }) {
  return (
    <div className={`companions companions--${layout}`}>
      {traces.map((trace, i) => {
        const isMarked = marked.has(trace.id)
        const spot = positions[i]
        return (
          <button
            key={trace.id}
            type="button"
            className={`companion ${isMarked ? 'companion--marked' : ''}`}
            style={{
              '--float-delay': `${i * -1.7}s`,
              '--float-duration': `${6 + i * 1.3}s`,
              ...(spot ? { left: `${spot.x}%`, top: `${spot.y}%`, '--tilt': `${spot.rotation}deg` } : {}),
            }}
            onClick={() => onToggle(trace)}
            aria-pressed={isMarked}
            aria-label={`${trace.memory}${isMarked ? ', with it today' : ''}`}
          >
            <span className="companion__float">
              <TraceThumb trace={trace} width={width} />
            </span>
            <span className="companion__label">{isMarked ? 'today ✓' : trace.memory}</span>
          </button>
        )
      })}
    </div>
  )
}
