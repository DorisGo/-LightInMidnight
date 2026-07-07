import MarkShape from '../MarkShape'
import { useShapePreferences } from '../../context/ShapePreferenceContext'
import { getPredefinedPlacement } from '../../lib/placement'
import './TraceSymbol.css'

/**
 * @typedef {import('../../models/trace').Trace} Trace
 */

/**
 * @param {{ trace: Trace, index: number, onSelect: (trace: Trace) => void }} props
 */
export default function TraceSymbol({ trace, index, onSelect }) {
  const { getMarkForTrace } = useShapePreferences()
  const mark = getMarkForTrace(trace)
  const placement = getPredefinedPlacement(index)

  return (
    <button
      type="button"
      className="trace-symbol"
      style={{
        left: `${placement.x}%`,
        top: `${placement.y}%`,
        transform: `translate(-50%, -50%) rotate(${placement.rotation}deg) scale(${placement.scale})`,
      }}
      aria-label={trace.memory}
      onClick={() => onSelect(trace)}
    >
      <MarkShape type={mark} size={32} />
    </button>
  )
}
