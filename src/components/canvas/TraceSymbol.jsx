import MarkShape from '../MarkShape'
import { markForCategory } from '../../models/trace'
import { getPredefinedPlacement } from '../../lib/placement'
import './TraceSymbol.css'

/**
 * @typedef {import('../../models/trace').Trace} Trace
 */

/**
 * @param {{ trace: Trace, index: number }} props
 */
export default function TraceSymbol({ trace, index }) {
  const mark = markForCategory(trace.category)
  const placement = getPredefinedPlacement(index)

  return (
    <div
      className="trace-symbol"
      style={{
        left: `${placement.x}%`,
        top: `${placement.y}%`,
        transform: `translate(-50%, -50%) rotate(${placement.rotation}deg) scale(${placement.scale})`,
      }}
      aria-label={trace.memory}
    >
      <MarkShape type={mark} size={32} />
    </div>
  )
}
