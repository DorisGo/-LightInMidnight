import MarkShape from '../MarkShape'
import { SHAPE_LABELS, SHAPE_PREFERENCE_OPTIONS } from '../../models/shapePreferences'
import './ShapePicker.css'

/**
 * @typedef {import('../../models/shapePreferences').ShapePreference} ShapePreference
 * @typedef {import('../../models/shapePreferences').MarkShapeType} MarkShapeType
 */

/**
 * @param {{
 *   selected: ShapePreference,
 *   onSelect: (shape: ShapePreference) => void,
 *   onClose: () => void,
 * }} props
 */
export default function ShapePicker({ selected, onSelect, onClose }) {
  return (
    <div className="shape-picker">
      <button
        type="button"
        className="shape-picker__backdrop"
        onClick={onClose}
        aria-label="Close shape picker"
      />

      <div className="shape-picker__panel" role="dialog" aria-label="Choose shape">
        <p className="shape-picker__title">Choose a shape</p>

        <div className="shape-picker__grid">
          {SHAPE_PREFERENCE_OPTIONS.map((shape) => {
            const previewType = shape === 'random' ? 'star' : /** @type {MarkShapeType} */ (shape)

            return (
              <button
                key={shape}
                type="button"
                className={`shape-picker__option ${selected === shape ? 'active' : ''}`}
                onClick={() => onSelect(shape)}
                aria-label={SHAPE_LABELS[shape]}
              >
                <span className="shape-picker__icon" aria-hidden="true">
                  {shape === 'random' ? (
                    <span className="shape-picker__random">?</span>
                  ) : (
                    <MarkShape type={previewType} size={24} />
                  )}
                </span>
                <span className="shape-picker__label">{SHAPE_LABELS[shape]}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
