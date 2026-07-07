import { useState } from 'react'
import { useTraces } from '../../context/TraceContext'
import TraceSymbol from '../canvas/TraceSymbol'
import TracePreview from './TracePreview'
import './Canvas.css'

export default function Canvas() {
  const { todayTraces } = useTraces()
  const [selectedTrace, setSelectedTrace] = useState(null)

  return (
    <main className="trace-canvas">
      {todayTraces.map((trace, index) => (
        <TraceSymbol
          key={trace.id}
          trace={trace}
          index={index}
          onSelect={setSelectedTrace}
        />
      ))}

      {selectedTrace && (
        <TracePreview
          trace={selectedTrace}
          onClose={() => setSelectedTrace(null)}
        />
      )}
    </main>
  )
}
