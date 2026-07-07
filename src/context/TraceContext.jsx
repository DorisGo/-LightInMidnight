import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { createTrace, applyTraceUpdate, loadTraces, saveTraces, isToday } from '../models/trace'

const TraceContext = createContext(null)

export function TraceProvider({ children }) {
  const [traces, setTraces] = useState(loadTraces)

  useEffect(() => {
    saveTraces(traces)
  }, [traces])

  const addTrace = useCallback((input) => {
    const trace = createTrace(input)
    setTraces((prev) => [...prev, trace])
    return trace
  }, [])

  const updateTrace = useCallback((id, input) => {
    setTraces((prev) =>
      prev.map((trace) => (trace.id === id ? applyTraceUpdate(trace, input) : trace)),
    )
  }, [])

  const deleteTrace = useCallback((id) => {
    setTraces((prev) => prev.filter((trace) => trace.id !== id))
  }, [])

  const todayTraces = traces
    .filter(isToday)
    .sort((a, b) => b.recordedAt - a.recordedAt)

  return (
    <TraceContext.Provider value={{ traces, todayTraces, addTrace, updateTrace, deleteTrace }}>
      {children}
    </TraceContext.Provider>
  )
}

export function useTraces() {
  const ctx = useContext(TraceContext)
  if (!ctx) throw new Error('useTraces must be used within TraceProvider')
  return ctx
}
