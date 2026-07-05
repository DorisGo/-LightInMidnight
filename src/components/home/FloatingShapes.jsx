import TraceSymbol from '../TraceSymbol'
import './FloatingShapes.css'

export default function FloatingShapes({ traces }) {
  return (
    <>
      {traces.map((trace) => (
        <div
          key={trace.id}
          className="trace-symbol"
          style={{
            left: `${trace.placement.x}%`,
            top: `${trace.placement.y}%`,
            transform: `rotate(${trace.placement.rotation}deg) scale(${trace.placement.scale})`,
          }}
        >
          <TraceSymbol type={trace.mark} size={32} />
        </div>
      ))}
      {/* TODO: tap a shape to open trace detail */}
      {/* TODO: entrance animation per new unlock */}
    </>
  )
}
