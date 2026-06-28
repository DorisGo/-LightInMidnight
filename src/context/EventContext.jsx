import { createContext, useContext, useState, useCallback } from 'react'

const EventContext = createContext(null)

const SYMBOL_TYPES = ['star', 'triangle', 'square', 'diamond', 'target', 'dots', 'squiggle']

function randomSymbol() {
  return SYMBOL_TYPES[Math.floor(Math.random() * SYMBOL_TYPES.length)]
}

function randomPosition() {
  return {
    x: 8 + Math.random() * 74,
    y: 12 + Math.random() * 58,
    rotation: -30 + Math.random() * 60,
    scale: 0.75 + Math.random() * 0.5,
  }
}

function isToday(date) {
  const now = new Date()
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  )
}

export function EventProvider({ children }) {
  const [events, setEvents] = useState([])

  const addEvent = useCallback((note = '') => {
    const event = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      note,
      symbol: randomSymbol(),
      position: randomPosition(),
    }
    setEvents((prev) => [...prev, event])
    return event
  }, [])

  const todayEvents = events
    .filter((e) => isToday(e.timestamp))
    .sort((a, b) => b.timestamp - a.timestamp)

  return (
    <EventContext.Provider value={{ events, todayEvents, addEvent }}>
      {children}
    </EventContext.Provider>
  )
}

export function useEvents() {
  const ctx = useContext(EventContext)
  if (!ctx) throw new Error('useEvents must be used within EventProvider')
  return ctx
}
