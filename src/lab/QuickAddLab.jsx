import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import MarkShape from '../components/MarkShape'
import QuickAddSheet from '../components/add/QuickAddSheet'
import { useShapePreferences } from '../context/ShapePreferenceContext'
import { pickOpenSpot } from '../lib/canvasPlacement'
import { createTrace, isSpan, toDateInputValue } from '../models/trace'
import { SAMPLE_TRACES } from './sampleTraces'
import './QuickAddLab.css'

/**
 * @typedef {import('../models/trace').Trace} Trace
 * @typedef {{ trace: Trace, x: number, y: number, rotation: number }} Placed
 */

const DAY_MS = 86400000

/**
 * Older traces fade, but never disappear.
 * @param {Trace} trace
 */
function glowFor(trace) {
  const days = (Date.now() - trace.occurredAt.getTime()) / DAY_MS
  return Math.max(0.22, 1 - days / 40)
}

/**
 * @param {Trace[]} traces
 * @returns {Placed[]}
 */
function placeAll(traces) {
  /** @type {Placed[]} */
  const placed = []
  for (const trace of traces) {
    placed.push({ trace, ...pickOpenSpot(placed, trace.id) })
  }
  return placed
}

/**
 * @param {{ placed: Placed, landing: boolean }} props
 */
function CanvasMark({ placed, landing }) {
  const { getMarkForTrace } = useShapePreferences()
  return (
    <span
      className={`lab-canvas__mark ${landing ? 'lab-canvas__mark--landing' : ''}`}
      style={{
        left: `${placed.x}%`,
        top: `${placed.y}%`,
        opacity: landing ? 1 : glowFor(placed.trace),
        '--rotation': `${placed.rotation}deg`,
      }}
      title={placed.trace.memory}
    >
      <MarkShape type={getMarkForTrace(placed.trace)} size={28} />
      {landing && <span className="lab-canvas__ripple" aria-hidden="true" />}
    </span>
  )
}

/**
 * The cover (or shape) travelling from the sheet down into its spot on the canvas.
 * @param {{ from: DOMRect, to: { x: number, y: number }, cover?: string, onDone: () => void }} props
 */
function Flight({ from, to, cover, onDone }) {
  const ref = useRef(/** @type {HTMLDivElement|null} */ (null))

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const dx = to.x - (from.left + from.width / 2)
    const dy = to.y - (from.top + from.height / 2)
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const animation = el.animate(
      [
        { transform: 'translate(0, 0) scale(1) rotate(-2deg)', borderRadius: '3px', opacity: 1 },
        { transform: `translate(${dx * 0.45}px, ${dy * 0.45 - 60}px) scale(0.55) rotate(8deg)`, borderRadius: '12px', opacity: 1, offset: 0.45 },
        { transform: `translate(${dx}px, ${dy}px) scale(0.12) rotate(0deg)`, borderRadius: '50%', opacity: 0.2 },
      ],
      { duration: reduce ? 1 : 900, easing: 'cubic-bezier(0.45, 0, 0.2, 1)', fill: 'forwards' },
    )
    animation.onfinish = onDone
    return () => animation.cancel()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div
      ref={ref}
      className="lab-flight"
      style={{ left: from.left, top: from.top, width: from.width, height: from.height }}
    >
      {cover ? <img src={cover} alt="" /> : <span className="lab-flight__spark" />}
    </div>
  )
}

export default function QuickAddLab() {
  const canvasRef = useRef(/** @type {HTMLDivElement|null} */ (null))
  const [placed, setPlaced] = useState(() =>
    placeAll(
      [...SAMPLE_TRACES]
        .filter((trace) => !isSpan(trace) && trace.occurredAt >= new Date(2026, 7, 20))
        .sort((a, b) => a.occurredAt - b.occurredAt),
    ),
  )
  const [open, setOpen] = useState(false)
  const [flight, setFlight] = useState(/** @type {null | { from: DOMRect, to: { x: number, y: number }, cover?: string, next: Placed }} */ (null))
  const [landingId, setLandingId] = useState(/** @type {string|null} */ (null))
  const [toast, setToast] = useState(/** @type {string|null} */ (null))
  const [sessions, setSessions] = useState(() => new Set(/** @type {string[]} */ ([])))

  const ongoing = useMemo(
    () => SAMPLE_TRACES.filter((trace) => trace.span?.status === 'ongoing'),
    [],
  )

  const today = new Date()
  const dateLine = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  const handleSave = (input, from) => {
    const trace = createTrace({ ...input, recordedAt: new Date() })
    const spot = pickOpenSpot(placed, trace.id)
    const next = { trace, ...spot }
    setOpen(false)

    const rect = canvasRef.current?.getBoundingClientRect()
    if (!from || !rect) {
      land(next)
      return
    }
    setFlight({
      from,
      to: { x: rect.left + (spot.x / 100) * rect.width, y: rect.top + (spot.y / 100) * rect.height },
      cover: trace.cover,
      next,
    })
  }

  const land = (/** @type {Placed} */ next) => {
    setFlight(null)
    setPlaced((prev) => [...prev, next])
    setLandingId(next.trace.id)
    const when = toDateInputValue(next.trace.occurredAt) === toDateInputValue(new Date())
      ? 'today'
      : next.trace.occurredAt.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
    setToast(`Left ${when}.`)
    window.setTimeout(() => setToast(null), 2600)
    window.setTimeout(() => setLandingId(null), 1600)
  }

  const toggleSession = (/** @type {Trace} */ trace) => {
    setSessions((prev) => {
      const next = new Set(prev)
      if (next.has(trace.id)) next.delete(trace.id)
      else next.add(trace.id)
      return next
    })
  }

  return (
    <div className="lab-add">
      <aside className="lab-add__notes">
        <p className="lab-add__eyebrow">Light In Midnight · 添加原型</p>
        <h1 className="lab-add__title">先输入，最后才是仪式</h1>
        <ol className="lab-add__steps">
          <li>点底部的 +，面板从底部升起，光标已经在输入框里</li>
          <li>直接打字，书、电影、音乐一起搜，不用先选类别</li>
          <li>选中结果（或回车选第一个），其他都是默认值，想改再点标签</li>
          <li>保存后，封面会飞进画布，落成一个痕迹</li>
        </ol>
        <p className="lab-add__try">可以试试：<em>千与千寻</em>、<em>活着</em>、<em>范特西</em>，或者随便写一句 <em>傍晚去河边散步</em></p>
        <p className="lab-add__small">这是原型，数据不会保存。画布上的痕迹越早越淡。</p>
      </aside>

      <div className="lab-add__phone">
        <header className="lab-home__header">
          <p className="lab-home__date">{dateLine}</p>
          <p className="lab-home__line">what stayed with you</p>
        </header>

        <div className="lab-canvas" ref={canvasRef}>
          {placed.map((item) => (
            <CanvasMark key={item.trace.id} placed={item} landing={item.trace.id === landingId} />
          ))}
        </div>

        {toast && <p className="lab-home__toast">{toast}</p>}

        {!open && (
          <button type="button" className="lab-home__add" onClick={() => setOpen(true)} aria-label="Leave a trace">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        )}

        {open && (
          <div className="lab-add__sheet-host">
            <QuickAddSheet
              ongoing={ongoing}
              sessionKeys={sessions}
              onSession={toggleSession}
              onSave={handleSave}
              onClose={() => setOpen(false)}
            />
          </div>
        )}
      </div>

      {flight && (
        <Flight from={flight.from} to={flight.to} cover={flight.cover} onDone={() => land(flight.next)} />
      )}
    </div>
  )
}
