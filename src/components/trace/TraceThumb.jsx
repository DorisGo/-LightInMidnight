import CoverImage from './CoverImage'
import { useState } from 'react'
import MarkShape from '../MarkShape'
import { useShapePreferences } from '../../context/ShapePreferenceContext'
import './TraceThumb.css'

/**
 * A trace's cover, falling back to its shape when there is none (or it fails to load).
 * @param {{ trace: import('../../models/trace').Trace, width?: number, className?: string }} props
 */
export default function TraceThumb({ trace, width = 34, className = '' }) {
  const { getMarkForTrace } = useShapePreferences()
  const [brokenSource, setBrokenSource] = useState(null)
  const height = Math.round(width * 1.42)

  if (trace.cover && brokenSource !== trace.cover) {
    return (
      <CoverImage
        className={`trace-thumb trace-thumb--cover ${className}`}
        src={trace.cover}
        alt=""
        width={width}
        height={height}
        loading="lazy"
        onError={() => setBrokenSource(trace.cover)}
      />
    )
  }

  return (
    <span
      className={`trace-thumb trace-thumb--mark ${className}`}
      style={{ width, height }}
      aria-hidden="true"
    >
      <MarkShape type={getMarkForTrace(trace)} size={Math.round(width * 0.62)} />
    </span>
  )
}
