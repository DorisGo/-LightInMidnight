import { useState } from 'react'
import { TRACE_CATEGORIES } from '../../models/trace'
import { useShapePreferences } from '../../context/ShapePreferenceContext'
import ShapePreferenceRow from './ShapePreferenceRow'
import ShapePicker from './ShapePicker'
import './ShapePreferencesSection.css'

/**
 * @typedef {import('../../models/trace').TraceCategory} TraceCategory
 */

export default function ShapePreferencesSection() {
  const { preferences, setCategoryPreference } = useShapePreferences()
  const [activeCategory, setActiveCategory] = useState(/** @type {TraceCategory | null} */ (null))

  return (
    <section className="shape-preferences">
      <h2 className="shape-preferences__title">Shape Preferences</h2>
      <p className="shape-preferences__hint">
        Choose how each trace type appears on your canvas.
      </p>

      <div className="shape-preferences__list">
        {TRACE_CATEGORIES.map((category) => (
          <ShapePreferenceRow
            key={category}
            category={category}
            onClick={() => setActiveCategory(category)}
          />
        ))}
      </div>

      {activeCategory && (
        <ShapePicker
          selected={preferences[activeCategory]}
          onSelect={(shape) => {
            setCategoryPreference(activeCategory, shape)
            setActiveCategory(null)
          }}
          onClose={() => setActiveCategory(null)}
        />
      )}
    </section>
  )
}
