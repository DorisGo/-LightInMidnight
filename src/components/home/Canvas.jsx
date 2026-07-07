import { useTraces } from '../../context/TraceContext'
import TraceSymbol from '../canvas/TraceSymbol'
import './Canvas.css'

export default function Canvas() {
  const { todayTraces } = useTraces()

  return (
    <main className="trace-canvas">
      {todayTraces.map((trace, index) => (
        <TraceSymbol key={trace.id} trace={trace} index={index} />
      ))}
    </main>
  )
}
