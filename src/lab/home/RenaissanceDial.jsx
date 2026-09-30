import { useId, useMemo } from 'react'
import { formatClock } from './useNow'
import { SIZE, C, polar, angleFor, angleForHour, dialStars } from './dialGeometry'
import './ClockDial.css'
import './RenaissanceDial.css'

/**
 * The same clock-and-sky, dressed as a Renaissance dial.
 * Italian clocks of the time (Uccello's in Florence Cathedral among them) ran on
 * 24 hours marked I–XXIV, which is exactly this dial: XXIV at the top for midnight.
 * A chapter ring of Roman numerals, a minute track, a beaded ring, a rosette
 * behind the hours, and a gilt hand with a small sun where it crosses today.
 */

/**
 * @typedef {import('../../models/trace').Trace} Trace
 */

const FACE = 50
const TRACK_IN = 52
const TRACK_OUT = 57
const CHAPTER_OUT = 81
const NUMERAL_R = 69
const BEADS = 85
const RINGS = { todayRing: 96, ringStep: 11, pastDays: 6 }
const OUTER = RINGS.todayRing + RINGS.pastDays * RINGS.ringStep + 8

const ROMAN = [
  ['X', 10], ['IX', 9], ['V', 5], ['IV', 4], ['I', 1],
]

function roman(/** @type {number} */ n) {
  let out = ''
  for (const [glyph, value] of ROMAN) {
    while (n >= value) {
      out += glyph
      n -= value
    }
  }
  return out
}

const deg = (/** @type {number} */ rad) => (rad * 180) / Math.PI

/** Twelve petals, like the rose window behind a cathedral clock. */
function Rosette() {
  return (
    <g className="ren-dial__rosette">
      {Array.from({ length: 12 }, (_, i) => (
        <ellipse
          key={i}
          cx={C}
          cy={C - FACE / 2}
          rx={FACE * 0.16}
          ry={FACE / 2}
          transform={`rotate(${i * 30} ${C} ${C})`}
        />
      ))}
      <circle cx={C} cy={C} r={FACE} />
      <circle cx={C} cy={C} r={FACE * 0.22} />
    </g>
  )
}

/**
 * @param {{ x: number, y: number, r?: number, rays?: number }} props
 */
function Sun({ x, y, r = 4, rays = 8 }) {
  return (
    <g className="ren-dial__sun">
      {Array.from({ length: rays }, (_, i) => {
        const a = (i / rays) * Math.PI * 2
        return (
          <line
            key={i}
            x1={x + Math.cos(a) * (r + 1.2)}
            y1={y + Math.sin(a) * (r + 1.2)}
            x2={x + Math.cos(a) * (r + (i % 2 ? 2.6 : 4))}
            y2={y + Math.sin(a) * (r + (i % 2 ? 2.6 : 4))}
          />
        )
      })}
      <circle cx={x} cy={y} r={r} />
    </g>
  )
}

/**
 * @param {{ x: number, y: number, r?: number }} props
 */
function Moon({ x, y, r = 5 }) {
  return (
    <path
      className="ren-dial__moon"
      // Outer edge: the long way round on the left. Inner edge: a flatter arc
      // (radius > r) bulging the same way, which leaves the crescent between.
      d={`M ${x + r * 0.2} ${y - r} A ${r} ${r} 0 1 0 ${x + r * 0.2} ${y + r} A ${r * 1.25} ${r * 1.25} 0 0 1 ${x + r * 0.2} ${y - r} Z`}
    />
  )
}

/**
 * @param {{ x: number, y: number, r?: number }} props
 */
function Star4({ x, y, r = 4 }) {
  const k = r * 0.28
  return (
    <path
      className="ren-dial__star4"
      d={`M ${x} ${y - r} L ${x + k} ${y - k} L ${x + r} ${y} L ${x + k} ${y + k} L ${x} ${y + r} L ${x - k} ${y + k} L ${x - r} ${y} L ${x - k} ${y - k} Z`}
    />
  )
}

/**
 * @param {{
 *   traces: Trace[],
 *   now: Date,
 *   landingId: string | null,
 *   onAdd: () => void,
 *   onSelect: (trace: Trace) => void,
 * }} props
 */
export default function RenaissanceDial({ traces, now, landingId, onAdd, onSelect }) {
  const blurId = `ren-blur-${useId().replace(/:/g, '')}`
  const stars = useMemo(() => dialStars(traces, now, RINGS), [traces, now])
  const today = stars.filter((star) => star.day === 0)

  const hand = angleFor(now)
  const handDeg = deg(hand)
  const along = (/** @type {number} */ r) => polar(r, hand)
  const lozenge = along(NUMERAL_R)
  const sun = along(RINGS.todayRing)
  const tip = along(OUTER - 4)

  return (
    <div className="clock-home__dial-wrap ren-dial">
      <svg className="clock-home__dial" viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label="Today and the six days before, on a 24-hour dial">
        <defs>
          <filter id={blurId} x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur stdDeviation="2.4" />
          </filter>
        </defs>

        {/* The days, one ring each, fainter outward. */}
        {Array.from({ length: RINGS.pastDays + 1 }, (_, day) => (
          <circle
            key={day}
            className={`ren-dial__day ${day === 0 ? 'ren-dial__day--today' : ''}`}
            cx={C}
            cy={C}
            r={RINGS.todayRing + day * RINGS.ringStep}
            style={{ opacity: day === 0 ? 1 : 0.85 - day * 0.11 }}
          />
        ))}

        {/* Outer border: a double line with small ornaments at the quarters. */}
        <circle className="ren-dial__border" cx={C} cy={C} r={OUTER} />
        <circle className="ren-dial__border ren-dial__border--thin" cx={C} cy={C} r={OUTER + 3} />
        {Array.from({ length: 24 }, (_, i) => {
          if (i % 6 === 0) return null
          const p = polar(OUTER + 1.5, angleForHour(i))
          return <circle key={i} className="ren-dial__stud" cx={p.x} cy={p.y} r={0.9} />
        })}
        {[0, 6, 12, 18].map((hour) => {
          const p = polar(OUTER + 1.5, angleForHour(hour))
          return (
            <g key={hour}>
              <circle className="ren-dial__cartouche" cx={p.x} cy={p.y} r={7.5} />
              {hour === 0 && <Moon x={p.x} y={p.y} r={4.2} />}
              {hour === 12 && <Sun x={p.x} y={p.y} r={2.4} />}
              {(hour === 6 || hour === 18) && <Star4 x={p.x} y={p.y} r={4} />}
            </g>
          )
        })}

        {/* Chapter ring: beads outside, numerals, minute track inside. */}
        {Array.from({ length: 96 }, (_, i) => {
          const a = angleForHour(i / 4)
          const p = polar(BEADS, a)
          return <circle key={i} className="ren-dial__bead" cx={p.x} cy={p.y} r={i % 4 === 0 ? 1.1 : 0.55} />
        })}
        <circle className="ren-dial__chapter" cx={C} cy={C} r={CHAPTER_OUT} />
        <circle className="ren-dial__chapter" cx={C} cy={C} r={TRACK_OUT} />
        <circle className="ren-dial__chapter ren-dial__chapter--thin" cx={C} cy={C} r={TRACK_IN} />
        {Array.from({ length: 96 }, (_, i) => {
          const a = angleForHour(i / 4)
          const hourMark = i % 4 === 0
          const from = polar(hourMark ? TRACK_IN : TRACK_IN + 2.2, a)
          const to = polar(TRACK_OUT, a)
          return <line key={i} className={`ren-dial__track ${hourMark ? 'ren-dial__track--hour' : ''}`} x1={from.x} y1={from.y} x2={to.x} y2={to.y} />
        })}
        {Array.from({ length: 24 }, (_, i) => {
          const hour = i === 0 ? 24 : i
          const a = angleForHour(i)
          const p = polar(NUMERAL_R, a)
          // Twenty-four Roman numerals don't fit side by side on a ring this size,
          // so they run along the radius as on an astrolabe, flipped on the left
          // half so none reads upside down.
          const turn = Math.cos(a) < -0.01 ? deg(a) + 180 : deg(a)
          return (
            <text
              key={i}
              className={`ren-dial__numeral ${i % 6 === 0 ? 'ren-dial__numeral--quarter' : ''}`}
              x={p.x}
              y={p.y}
              transform={`rotate(${turn} ${p.x} ${p.y})`}
            >
              {roman(hour)}
            </text>
          )
        })}

        <Rosette />

        {today.slice(1).map((star, i) => (
          <line key={star.trace.id} className="clock-home__link" x1={today[i].x} y1={today[i].y} x2={star.x} y2={star.y} />
        ))}

        {/* The hand: a gilt spear with a lozenge on the hours and a sun on today. */}
        <g className="ren-dial__hand">
          <line x1={along(FACE + 1).x} y1={along(FACE + 1).y} x2={tip.x} y2={tip.y} />
          <polygon
            points={`${NUMERAL_R - 7},0 ${NUMERAL_R},-3.2 ${NUMERAL_R + 7},0 ${NUMERAL_R},3.2`}
            transform={`translate(${C} ${C}) rotate(${handDeg})`}
          />
          <polygon
            className="ren-dial__hand-tip"
            points={`${OUTER - 12},-2.6 ${OUTER - 2},0 ${OUTER - 12},2.6 ${OUTER - 9.5},0`}
            transform={`translate(${C} ${C}) rotate(${handDeg})`}
          />
          <circle className="ren-dial__hand-glow" cx={sun.x} cy={sun.y} r={6} filter={`url(#${blurId})`} />
          <Sun x={sun.x} y={sun.y} r={2.6} />
          <circle className="ren-dial__hand-pin" cx={lozenge.x} cy={lozenge.y} r={0.9} />
        </g>

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

      <button type="button" className="clock-home__time ren-dial__time" onClick={onAdd} aria-label="Leave a trace">
        <span className="ren-dial__hora">Hora</span>
        <span className="clock-home__time-digits">{formatClock(now)}</span>
        <span className="clock-home__time-hint">leave a trace</span>
      </button>
    </div>
  )
}
