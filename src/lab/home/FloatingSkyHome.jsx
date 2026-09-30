import { useMemo, useRef } from 'react'
import Companions from './Companions'
import { formatClock } from './useNow'
import { pickOpenSpot } from '../../lib/canvasPlacement'
import './FloatingSkyHome.css'

/**
 * Direction B — a sky behind, covers floating in front.
 * Recent traces form a field of stars; what is still keeping you company floats
 * over it as covers. The small clock at the top is how you leave a trace.
 */

/**
 * @typedef {import('../../models/trace').Trace} Trace
 */

const DAY_MS = 86400000

/** Covers keep to the middle band so they never sit on the clock or the edges. */
const COVER_SPOTS = [
  { x: 30, y: 40, rotation: -6 },
  { x: 70, y: 52, rotation: 5 },
  { x: 40, y: 70, rotation: -2 },
]

/**
 * @param {{
 *   traces: Trace[],
 *   companions: Trace[],
 *   marked: Set<string>,
 *   now: Date,
 *   landingId: string | null,
 *   showHint: boolean,
 *   onAdd: () => void,
 *   onToggle: (trace: Trace) => void,
 *   onSelect: (trace: Trace) => void,
 * }} props
 */
export default function FloatingSkyHome({ traces, companions, marked, now, landingId, showHint, onAdd, onToggle, onSelect }) {
  const rootRef = useRef(/** @type {HTMLDivElement|null} */ (null))

  const stars = useMemo(() => {
    const moments = traces
      .filter((trace) => !trace.span)
      .sort((a, b) => a.recordedAt - b.recordedAt)
    /** @type {{ x: number, y: number }[]} */
    const taken = [...COVER_SPOTS]
    return moments.map((trace) => {
      const age = Math.max(0, (now - trace.recordedAt) / DAY_MS)
      const spot = pickOpenSpot(taken, trace.id)
      taken.push(spot)
      return {
        trace,
        x: spot.x,
        // Keep stars clear of the clock at the top.
        y: 18 + spot.y * 0.78,
        recent: age < 3,
        size: age < 1 ? 5 : age < 3 ? 4 : 3,
        opacity: Math.max(0.3, 1 - age / 8),
      }
    })
  }, [traces, now])

  // Join stars left on the same day, and only near neighbours, so lines stay quiet.
  const links = stars.slice(1).flatMap((star, i) => {
    const prev = stars[i]
    const sameDay = prev.trace.recordedAt.toDateString() === star.trace.recordedAt.toDateString()
    const close = Math.hypot(prev.x - star.x, prev.y - star.y) < 32
    return star.recent && sameDay && close ? [{ id: star.trace.id, a: prev, b: star }] : []
  })

  const handleMove = (/** @type {import('react').PointerEvent} */ e) => {
    const el = rootRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    el.style.setProperty('--px', String((e.clientX - rect.left) / rect.width - 0.5))
    el.style.setProperty('--py', String((e.clientY - rect.top) / rect.height - 0.5))
  }

  return (
    <div className="float-home" ref={rootRef} onPointerMove={handleMove}>
      <div className="float-home__sky" aria-hidden="true">
        <svg className="float-home__links" viewBox="0 0 100 100" preserveAspectRatio="none">
          {links.map(({ id, a, b }) => (
            <line key={id} x1={a.x} y1={a.y} x2={b.x} y2={b.y} vectorEffect="non-scaling-stroke" />
          ))}
        </svg>
      </div>

      <div className="float-home__stars">
        {stars.map((star) => (
          <button
            key={star.trace.id}
            type="button"
            className={`float-home__star ${star.trace.id === landingId ? 'float-home__star--landing' : ''}`}
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: star.size,
              height: star.size,
              opacity: star.trace.id === landingId ? 1 : star.opacity,
            }}
            onClick={() => onSelect(star.trace)}
            aria-label={star.trace.memory}
          />
        ))}
      </div>

      <button type="button" className="float-home__clock" onClick={onAdd} aria-label="Leave a trace">
        <span className="float-home__clock-time">{formatClock(now)}</span>
        <span className="float-home__clock-day">
          {now.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
        </span>
        <span className="float-home__clock-plus" aria-hidden="true">+</span>
      </button>
      {showHint && <p className="float-home__hint">tap the time to leave a trace</p>}

      <div className="float-home__covers">
        <Companions
          traces={companions}
          marked={marked}
          onToggle={onToggle}
          layout="scatter"
          positions={COVER_SPOTS}
          width={62}
        />
      </div>
    </div>
  )
}
