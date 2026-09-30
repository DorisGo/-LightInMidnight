import { useMemo, useRef } from 'react'
import RenaissanceDial from './RenaissanceDial'
import Companions from './Companions'
import './MixedHome.css'

/**
 * Direction C — A's clock (dressed as a Renaissance dial), B's floating covers.
 * The dial keeps its meaning (today inside, the days before around it); below it,
 * what keeps you company floats larger and tilted, over a faint dust of stars.
 * Three layers drift at different depths as the pointer moves.
 */

/**
 * @typedef {import('../../models/trace').Trace} Trace
 */

/** Scattered, tilted, at different heights — never a tidy row. */
const COVER_SPOTS = [
  { x: 24, y: 42, rotation: -7 },
  { x: 53, y: 64, rotation: 4 },
  { x: 80, y: 38, rotation: -3 },
]

/**
 * @param {string} seed
 */
function hash(seed) {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  // Final avalanche, so seeds that differ by one character don't land in a line.
  h ^= h >>> 16
  h = Math.imul(h, 0x85ebca6b)
  h ^= h >>> 13
  h = Math.imul(h, 0xc2b2ae35)
  h ^= h >>> 16
  return (h >>> 0) / 4294967295
}

/** Background dust: decoration only, the same every time. */
const DUST = Array.from({ length: 46 }, (_, i) => ({
  x: hash(`dust-x${i}`) * 100,
  y: hash(`dust-y${i}`) * 100,
  size: 1 + hash(`dust-s${i}`) * 1.4,
  delay: hash(`dust-d${i}`) * 8,
}))

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
export default function MixedHome({ traces, companions, marked, now, landingId, showHint, onAdd, onToggle, onSelect }) {
  const rootRef = useRef(/** @type {HTMLDivElement|null} */ (null))
  const dust = useMemo(() => DUST, [])

  const handleMove = (/** @type {import('react').PointerEvent} */ e) => {
    const el = rootRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    el.style.setProperty('--px', String((e.clientX - rect.left) / rect.width - 0.5))
    el.style.setProperty('--py', String((e.clientY - rect.top) / rect.height - 0.5))
  }

  return (
    <div className="mix-home" ref={rootRef} onPointerMove={handleMove}>
      <div className="mix-home__dust" aria-hidden="true">
        {dust.map((mote, i) => (
          <span
            key={i}
            style={{
              left: `${mote.x}%`,
              top: `${mote.y}%`,
              width: mote.size,
              height: mote.size,
              animationDelay: `${mote.delay}s`,
            }}
          />
        ))}
      </div>

      <header className="mix-home__header">
        <p className="mix-home__date">
          {now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </header>

      <div className="mix-home__dial">
        <RenaissanceDial traces={traces} now={now} landingId={landingId} onAdd={onAdd} onSelect={onSelect} />
        {showHint && <p className="mix-home__hint">tap the time to leave a trace</p>}
      </div>

      <section className="mix-home__drift" aria-label="Still with you">
        <p className="mix-home__drift-label">still with you</p>
        <div className="mix-home__covers">
          <Companions
            traces={companions}
            marked={marked}
            onToggle={onToggle}
            layout="scatter"
            positions={COVER_SPOTS}
            width={60}
          />
        </div>
      </section>
    </div>
  )
}
