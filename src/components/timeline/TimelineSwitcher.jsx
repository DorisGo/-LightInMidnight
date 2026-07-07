import './TimelineSwitcher.css'

/** @typedef {'week' | 'month' | 'year'} TimelineMode */

const MODES = [
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
  { value: 'year', label: 'Year' },
]

/**
 * @param {{ mode: TimelineMode, onModeChange: (mode: TimelineMode) => void }} props
 */
export default function TimelineSwitcher({ mode, onModeChange }) {
  return (
    <div className="timeline-switcher" role="tablist" aria-label="Timeline view">
      {MODES.map(({ value, label }) => (
        <button
          key={value}
          type="button"
          role="tab"
          aria-selected={mode === value}
          className={`timeline-switcher__option ${mode === value ? 'active' : ''}`}
          onClick={() => onModeChange(value)}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
