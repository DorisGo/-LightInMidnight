import { useAppearance } from '../../context/AppearanceContext'
import { PALETTE_OPTIONS, MODE_OPTIONS, SKY_OPTIONS } from '../../models/appearance'
import './AppearanceSection.css'

/**
 * @template {string} T
 * @param {{ label: string, options: { value: T, label: string }[], value: T, onChange: (value: T) => void }} props
 */
function Segmented({ label, options, value, onChange }) {
  return (
    <div className="appearance__segmented" role="radiogroup" aria-label={label}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={value === option.value}
          className={`appearance__segment ${value === option.value ? 'active' : ''}`}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

export default function AppearanceSection() {
  const { appearance, setAppearance } = useAppearance()

  return (
    <section className="appearance">
      <h2 className="appearance__title">Appearance</h2>
      <p className="appearance__hint">The light your traces are kept in.</p>

      <div className="appearance__palettes" role="radiogroup" aria-label="Palette">
        {PALETTE_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={appearance.palette === option.value}
            className={`appearance__palette ${appearance.palette === option.value ? 'active' : ''}`}
            onClick={() => setAppearance({ palette: option.value })}
          >
            <span className="appearance__swatches" aria-hidden="true">
              {option.swatches.map((color) => (
                <i key={color} style={{ background: color }} />
              ))}
            </span>
            <span className="appearance__palette-text">
              <span className="appearance__palette-name">{option.label}</span>
              <span className="appearance__palette-hint">{option.hint}</span>
            </span>
          </button>
        ))}
      </div>

      <div className="appearance__row">
        <span className="appearance__label">Time of day</span>
        <Segmented
          label="Time of day"
          options={MODE_OPTIONS}
          value={appearance.mode}
          onChange={(mode) => setAppearance({ mode })}
        />
      </div>

      {appearance.mode === 'paper' && (
        <div className="appearance__row">
          <span className="appearance__label">Year view</span>
          <Segmented
            label="Year view"
            options={SKY_OPTIONS}
            value={appearance.sky}
            onChange={(sky) => setAppearance({ sky })}
          />
        </div>
      )}
    </section>
  )
}
