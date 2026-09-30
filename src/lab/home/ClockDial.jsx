import { useId, useMemo } from 'react'
import { formatClock } from './useNow'
import { SIZE, C, polar, angleFor, dialStars } from './dialGeometry'
import './ClockDial.css'

/**
 * The clock that is also a sky.
 * A 24-hour dial with midnight at the top. Today's traces sit on the inner ring
 * at the time they were left; each ring outward is a day further back, fainter.
 * The hand points at now, and the time in the middle is how you leave a trace.
 */

/**
 * @typedef {import('../../models/trace').Trace} Trace
 */

const DIAL = 66
const RINGS = { todayRing: 90, ringStep: 13, pastDays: 6 }
const { todayRing: TODAY_RING, ringStep: RING_STEP, pastDays: PAST_DAYS } = RINGS

const HOUR_LABELS = [
  { hour: 0, label: '0' },
  { hour: 6, label: '6' },
  { hour: 12, label: '12' },
  { hour: 18, label: '18' },
]

/**
 * @param {{
 *   traces: Trace[],
 *   now: Date,
 *   landingId: string | null,
 *   onAdd: () => void,
 *   onSelect: (trace: Trace) => void,
 * }} props
 */
export default function ClockDial({ traces, now, landingId, onAdd, onSelect }) {
  // Two dials can share a page (the lab), so the blur filter needs its own id.
  const blurId = `clock-blur-${useId().replace(/:/g, '')}`
  const stars = useMemo(() => dialStars(traces, now, RINGS), [traces, now])

  const today = stars.filter((star) => star.day === 0)
  const handAngle = angleFor(now)
  const handFrom = polar(DIAL + 2, handAngle)
  const handTo = polar(TODAY_RING + PAST_DAYS * RING_STEP + 8, handAngle)
  const handHead = polar(TODAY_RING, handAngle)

  return (
    <div className="clock-home__dial-wrap">
      <svg className="clock-home__dial" viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label="Today and the six days before, as a clock">
        <defs>
          <filter id={blurId} x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur stdDeviation="2.4" />
          </filter>
        </defs>

        {Array.from({ length: PAST_DAYS + 1 }, (_, day) => (
          <circle
            key={day}
            className={`clock-home__ring ${day === 0 ? 'clock-home__ring--today' : ''}`}
            cx={C}
            cy={C}
            r={TODAY_RING + day * RING_STEP}
            style={{ opacity: day === 0 ? 1 : 0.9 - day * 0.12 }}
          />
        ))}

        {Array.from({ length: 24 }, (_, hour) => {
          const a = (hour / 24) * Math.PI * 2 - Math.PI / 2
          const major = hour % 6 === 0
          const from = polar(DIAL - (major ? 7 : 4), a)
          const to = polar(DIAL, a)
          return <line key={hour} className="clock-home__tick" x1={from.x} y1={from.y} x2={to.x} y2={to.y} style={{ opacity: major ? 0.7 : 0.3 }} />
        })}

        {HOUR_LABELS.map(({ hour, label }) => {
          const p = polar(DIAL + 11, (hour / 24) * Math.PI * 2 - Math.PI / 2)
          return <text key={hour} className="clock-home__hour" x={p.x} y={p.y}>{label}</text>
        })}

        {today.slice(1).map((star, i) => (
          <line key={star.trace.id} className="clock-home__link" x1={today[i].x} y1={today[i].y} x2={star.x} y2={star.y} />
        ))}

        <line className="clock-home__hand" x1={handFrom.x} y1={handFrom.y} x2={handTo.x} y2={handTo.y} />
        <circle className="clock-home__hand-glow" cx={handHead.x} cy={handHead.y} r={5} filter={`url(#${blurId})`} />
        <circle className="clock-home__hand-head" cx={handHead.x} cy={handHead.y} r={2.4} />

        {stars.map((star) => (
          <g
            key={star.trace.id}
            className={`clock-home__star ${star.trace.id === landingId ? 'clock-home__star--landing' : ''}`}
            style={{ opacity: star.opacity, transformOrigin: `${star.x}px ${star.y}px` }}
            onClick={() => onSelect(star.trace)}
            role="button"
            tabIndex={0}
            aria-label={star.trace.memory}
            onKeyDown={(e) => { if (e.key === 'Enter') onSelect(star.trace) }}
          >
            <circle className="clock-home__star-hit" cx={star.x} cy={star.y} r={8} />
            <circle className="clock-home__star-glow" cx={star.x} cy={star.y} r={star.size * 2.4} filter={`url(#${blurId})`} />
            <circle className="clock-home__star-core" cx={star.x} cy={star.y} r={star.size} />
            {star.trace.id === landingId && (
              <circle className="clock-home__ripple" cx={star.x} cy={star.y} r={6} />
            )}
          </g>
        ))}
      </svg>

      <button type="button" className="clock-home__time" onClick={onAdd} aria-label="Leave a trace">
        <span className="clock-home__time-digits">{formatClock(now)}</span>
        <span className="clock-home__time-hint">leave a trace</span>
      </button>
    </div>
  )
}
