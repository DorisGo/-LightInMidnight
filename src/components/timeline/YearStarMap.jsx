import { useMemo } from 'react'
import { buildStarMap, monthMarks, todayMark, SIZE, CENTER } from '../../lib/starmap'
import './YearStarMap.css'

/**
 * @typedef {import('../../models/trace').Trace} Trace
 */

const MONTH_INITIALS = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D']

/**
 * A year drawn as a night sky: moments are stars, lasting traces are arcs.
 * @param {{ traces: Trace[], year: number, onSelect: (trace: Trace) => void }} props
 */
export default function YearStarMap({ traces, year, onSelect }) {
  const { stars, arcs, links } = useMemo(() => buildStarMap(traces, year), [traces, year])
  const months = useMemo(() => monthMarks(year), [year])
  const now = todayMark(new Date(), year)
  const isEmpty = stars.length === 0 && arcs.length === 0

  const handleKey = (/** @type {import('react').KeyboardEvent} */ e, /** @type {Trace} */ trace) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onSelect(trace)
    }
  }

  return (
    <figure className="star-map">
      <svg
        className="star-map__sky"
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        role="img"
        aria-label={`Traces of ${year}`}
      >
        <defs>
          <radialGradient id="star-map-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#4a4796" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#4a4796" stopOpacity="0" />
          </radialGradient>
          <filter id="star-map-blur" x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur stdDeviation="2.2" />
          </filter>
        </defs>

        <circle cx={CENTER} cy={CENTER} r={CENTER - 8} fill="url(#star-map-glow)" />
        <circle className="star-map__rim" cx={CENTER} cy={CENTER} r={148} />
        <circle className="star-map__orbit" cx={CENTER} cy={CENTER} r={100} />

        {months.map(({ month, tickFrom, tickTo, label }) => (
          <g key={month}>
            <line className="star-map__tick" x1={tickFrom.x} y1={tickFrom.y} x2={tickTo.x} y2={tickTo.y} />
            <text className="star-map__month" x={label.x} y={label.y}>
              {MONTH_INITIALS[month]}
            </text>
          </g>
        ))}

        {now && (
          <line className="star-map__today" x1={now.from.x} y1={now.from.y} x2={now.to.x} y2={now.to.y} />
        )}

        {links.map((link, i) => (
          <line key={i} className="star-map__link" {...link} />
        ))}

        {arcs.map((arc) => {
          const status = arc.trace.span?.status ?? 'ongoing'
          return (
            <g
              key={arc.trace.id}
              className={`star-map__arc star-map__arc--${status}`}
              role="button"
              tabIndex={0}
              aria-label={arc.trace.memory}
              onClick={() => onSelect(arc.trace)}
              onKeyDown={(e) => handleKey(e, arc.trace)}
            >
              <path className="star-map__arc-hit" d={arc.path} />
              <path className="star-map__arc-line" d={arc.path} />
              {arc.sessions.map((point, i) => (
                <circle key={i} className="star-map__session" cx={point.x} cy={point.y} r={1.5} />
              ))}
              {status === 'ongoing' && arc.endsInYear && (
                <>
                  <circle className="star-map__head-glow" cx={arc.head.x} cy={arc.head.y} r={3.5} filter="url(#star-map-blur)" />
                  <circle className="star-map__head" cx={arc.head.x} cy={arc.head.y} r={1.8} />
                </>
              )}
            </g>
          )
        })}

        {stars.map((star) => (
          <g
            key={star.trace.id}
            className="star-map__star"
            role="button"
            tabIndex={0}
            aria-label={star.trace.memory}
            onClick={() => onSelect(star.trace)}
            onKeyDown={(e) => handleKey(e, star.trace)}
            style={{ '--twinkle-delay': `${star.twinkleDelay}s` }}
          >
            <circle className="star-map__star-hit" cx={star.x} cy={star.y} r={9} />
            <circle className="star-map__star-glow" cx={star.x} cy={star.y} r={star.size * 2.2} filter="url(#star-map-blur)" />
            <circle className="star-map__star-core" cx={star.x} cy={star.y} r={star.size} />
          </g>
        ))}

        <text className="star-map__year" x={CENTER} y={CENTER - 2}>{year}</text>
        <text className="star-map__caption" x={CENTER} y={CENTER + 18}>
          {isEmpty ? 'a quiet sky, for now' : 'a year of traces'}
        </text>
      </svg>

      <figcaption className="star-map__legend">
        <span><i className="star-map__legend-star" /> a moment</span>
        <span><i className="star-map__legend-arc" /> a while</span>
      </figcaption>
    </figure>
  )
}
