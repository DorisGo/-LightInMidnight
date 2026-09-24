import { useState } from 'react'
import CalendarMonth from '../components/timeline/CalendarMonth'
import TimelineGroup from '../components/timeline/TimelineGroup'
import YearStarMap from '../components/timeline/YearStarMap'
import TracePreview from '../components/home/TracePreview'
import { tracesOnDay } from '../lib/calendar'
import { toDateInputValue } from '../models/trace'
import { SAMPLE_TRACES, SAMPLE_MONTH } from './sampleTraces'
import './ThemeLabPage.css'

/**
 * @typedef {import('../models/trace').Trace} Trace
 * @typedef {'indigo'|'candle'|'amber'} Palette
 * @typedef {'paper'|'night'} Mode
 */

const PALETTES = /** @type {{ value: Palette, name: string, note: string, swatches: string[] }[]} */ ([
  {
    value: 'indigo',
    name: '靛蓝',
    note: '现在的颜色，一种墨水贯穿全站',
    swatches: ['#f5f5f0', '#3f3d89', '#15143a'],
  },
  {
    value: 'candle',
    name: '烛光',
    note: '靛蓝为底，琥珀只点亮"今天"和"在读"',
    swatches: ['#f6f2e9', '#3f3d89', '#f2b457'],
  },
  {
    value: 'amber',
    name: '琥珀',
    note: '整体转暖，像旧纸和深夜的台灯',
    swatches: ['#f4ede0', '#5b3a1f', '#f0a640'],
  },
])

const MODES = /** @type {{ value: Mode, name: string, note: string }[]} */ ([
  { value: 'paper', name: '纸 · Paper', note: '白天，像一本手账' },
  { value: 'night', name: '星空 · Night', note: '夜里，像抬头看天' },
])

/**
 * One themed phone screen showing the calendar, a day, and the year.
 * @param {{ mode: Mode, palette: Palette, atlas: boolean, onSelect: (trace: Trace, mode: Mode) => void }} props
 */
function ThemeFrame({ mode, palette, atlas, onSelect }) {
  const [selectedDay, setSelectedDay] = useState(() => new Date())
  const dayTraces = tracesOnDay(SAMPLE_TRACES, selectedDay)
  const label = selectedDay.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })

  return (
    <div
      className="lab-frame"
      data-mode={mode}
      data-palette={palette}
      data-sky={atlas ? 'atlas' : 'glow'}
    >
      <header className="lab-frame__header">
        <p className="lab-frame__eyebrow">Timeline</p>
        <h2 className="lab-frame__month">September <span>2026</span></h2>
      </header>

      <CalendarMonth
        traces={SAMPLE_TRACES}
        referenceDate={SAMPLE_MONTH}
        selectedKey={toDateInputValue(selectedDay)}
        onSelectDay={setSelectedDay}
        onSelectTrace={(trace) => onSelect(trace, mode)}
      />

      <div className="lab-frame__day">
        {dayTraces.length > 0 ? (
          <TimelineGroup label={label} traces={dayTraces} onSelect={(trace) => onSelect(trace, mode)} />
        ) : (
          <p className="lab-frame__quiet">{label} · A quiet day.</p>
        )}
      </div>

      <div className="lab-frame__year">
        <YearStarMap traces={SAMPLE_TRACES} year={2026} onSelect={(trace) => onSelect(trace, mode)} />
      </div>
    </div>
  )
}

export default function ThemeLabPage() {
  const [palette, setPalette] = useState(/** @type {Palette} */ ('indigo'))
  const [atlas, setAtlas] = useState(false)
  const [preview, setPreview] = useState(/** @type {{ trace: Trace, mode: Mode } | null} */ (null))

  return (
    <div className="lab">
      <header className="lab__intro">
        <p className="lab__eyebrow">Light In Midnight · 设计对比</p>
        <h1 className="lab__title">纸与星空</h1>
        <p className="lab__lede">
          同一个月、同一份数据，放在两种气质里。先选一种颜色，再对比左右两边。
          点日期、封面或星星都能正常交互。
        </p>
      </header>

      <section className="lab__controls" aria-label="配色">
        {PALETTES.map((option) => (
          <button
            key={option.value}
            type="button"
            className={`lab-palette ${palette === option.value ? 'active' : ''}`}
            onClick={() => setPalette(option.value)}
            aria-pressed={palette === option.value}
          >
            <span className="lab-palette__swatches" aria-hidden="true">
              {option.swatches.map((color) => (
                <i key={color} style={{ background: color }} />
              ))}
            </span>
            <span className="lab-palette__name">{option.name}</span>
            <span className="lab-palette__note">{option.note}</span>
          </button>
        ))}
      </section>

      <label className="lab__toggle">
        <input type="checkbox" checked={atlas} onChange={(e) => setAtlas(e.target.checked)} />
        <span>纸张模式下，把年视图印成墨色星图（不发光）</span>
      </label>

      <div className="lab__frames">
        {MODES.map((mode) => (
          <section key={mode.value} className="lab__column">
            <h3 className="lab__column-title">
              {mode.name}
              <span>{mode.note}</span>
            </h3>
            <ThemeFrame
              mode={mode.value}
              palette={palette}
              atlas={atlas}
              onSelect={(trace, m) => setPreview({ trace, mode: m })}
            />
          </section>
        ))}
      </div>

      {preview && (
        <div data-mode={preview.mode} data-palette={palette} className="lab__preview">
          <TracePreview trace={preview.trace} onClose={() => setPreview(null)} />
        </div>
      )}
    </div>
  )
}
