import { useMemo, useState } from 'react'
import QuickAddSheet from '../components/add/QuickAddSheet'
import TracePreview from '../components/home/TracePreview'
import ClockSkyHome from './home/ClockSkyHome'
import FloatingSkyHome from './home/FloatingSkyHome'
import MixedHome from './home/MixedHome'
import { useNow } from './home/useNow'
import { buildHomeSample, companions as pickCompanions } from './homeSample'
import { useAppearance } from '../context/AppearanceContext'
import { createTrace } from '../models/trace'
import './HomeLab.css'

/**
 * @typedef {import('../models/trace').Trace} Trace
 * @typedef {'paper'|'night'} Mode
 */

const DIRECTIONS = [
  {
    key: 'mixed',
    name: 'C · 混搭',
    note: 'A 的钟面，加上 B 那种更大、会漂浮的封面',
    Home: MixedHome,
  },
  {
    key: 'clock',
    name: 'A · 钟面星空',
    note: '时钟就是星图：内圈是今天，往外一圈是前一天',
    Home: ClockSkyHome,
  },
  {
    key: 'float',
    name: 'B · 浮在星空上',
    note: '星空做底，陪着你的封面浮在上面，时钟在顶部',
    Home: FloatingSkyHome,
  },
]

/**
 * One phone running one direction, with its own traces so the two can be tried independently.
 * @param {{ direction: typeof DIRECTIONS[number], mode: Mode, palette: string }} props
 */
function Phone({ direction, mode, palette }) {
  const now = useNow()
  const [traces, setTraces] = useState(buildHomeSample)
  const [marked, setMarked] = useState(() => new Set(/** @type {string[]} */ ([])))
  const [sheetOpen, setSheetOpen] = useState(false)
  const [landingId, setLandingId] = useState(/** @type {string|null} */ (null))
  const [hint, setHint] = useState(true)
  const [preview, setPreview] = useState(/** @type {Trace|null} */ (null))

  const companions = useMemo(() => pickCompanions(traces), [traces])
  const ongoing = useMemo(() => traces.filter((trace) => trace.span?.status === 'ongoing'), [traces])

  const toggle = (/** @type {Trace} */ trace) =>
    setMarked((prev) => {
      const next = new Set(prev)
      if (next.has(trace.id)) next.delete(trace.id)
      else next.add(trace.id)
      return next
    })

  const open = () => {
    setHint(false)
    setSheetOpen(true)
  }

  const save = (input) => {
    // The prototype files every new trace at this very moment, so it lands where the hand points.
    const trace = createTrace({ ...input, recordedAt: new Date() })
    setSheetOpen(false)
    window.setTimeout(() => {
      setTraces((prev) => [...prev, trace])
      setLandingId(trace.id)
      window.setTimeout(() => setLandingId(null), 1800)
    }, 260)
  }

  const { Home } = direction

  return (
    <section className="home-lab__column">
      <h2 className="home-lab__name">{direction.name}</h2>
      <p className="home-lab__note">{direction.note}</p>

      <div className="home-lab__phone home-frame" data-mode={mode} data-palette={palette}>
        <Home
          traces={traces}
          companions={companions}
          marked={marked}
          now={now}
          landingId={landingId}
          showHint={hint}
          onAdd={open}
          onToggle={toggle}
          onSelect={setPreview}
        />

        {sheetOpen && (
          <QuickAddSheet
            ongoing={ongoing}
            sessionKeys={marked}
            onSession={toggle}
            onSave={save}
            onClose={() => setSheetOpen(false)}
          />
        )}

        {preview && <TracePreview trace={preview} onClose={() => setPreview(null)} />}
      </div>
    </section>
  )
}

export default function HomeLab() {
  const { appearance } = useAppearance()
  const [mode, setMode] = useState(/** @type {Mode} */ ('night'))

  return (
    <div className="home-lab">
      <header className="home-lab__intro">
        <p className="home-lab__eyebrow">Light In Midnight · 首页对比</p>
        <h1 className="home-lab__title">此刻</h1>
        <p className="home-lab__lede">
          首页讲"现在"，Timeline 讲"过去"。两种方向用同一份数据，都能直接操作：
          点时间留下痕迹，点封面表示"今天也在"，点星星查看那一刻。
        </p>
        <div className="home-lab__modes" role="radiogroup" aria-label="Time of day">
          {/** @type {Mode[]} */ (['night', 'paper']).map((value) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={mode === value}
              className={`home-lab__mode ${mode === value ? 'active' : ''}`}
              onClick={() => setMode(value)}
            >
              {value === 'night' ? '星空 · Night' : '纸 · Paper'}
            </button>
          ))}
        </div>
      </header>

      <div className="home-lab__phones">
        {DIRECTIONS.map((direction) => (
          <Phone key={direction.key} direction={direction} mode={mode} palette={appearance.palette} />
        ))}
      </div>
    </div>
  )
}
