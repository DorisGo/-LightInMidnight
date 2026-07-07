import MarkShape from '../MarkShape'
import { CATEGORY_LABELS } from '../../models/trace'
import { SHAPE_LABELS } from '../../models/shapePreferences'
import { useShapePreferences } from '../../context/ShapePreferenceContext'
import './ShapePreferenceRow.css'

/**
 * @typedef {import('../../models/trace').TraceCategory} TraceCategory
 */

/**
 * @param {{ category: TraceCategory, onClick: () => void }} props
 */
export default function ShapePreferenceRow({ category, onClick }) {
  const { preferences, getCategoryPreviewMark } = useShapePreferences()
  const preference = preferences[category]
  const previewMark = getCategoryPreviewMark(category)

  return (
    <button type="button" className="shape-preference-row" onClick={onClick}>
      <div className="shape-preference-row__icon" aria-hidden="true">
        <MarkShape type={previewMark} size={22} />
      </div>

      <div className="shape-preference-row__body">
        <span className="shape-preference-row__type">{CATEGORY_LABELS[category]}</span>
        <span className="shape-preference-row__shape">{SHAPE_LABELS[preference]}</span>
      </div>

      <span className="shape-preference-row__chevron" aria-hidden="true">›</span>
    </button>
  )
}
