import { useNavigate } from 'react-router-dom'
import { useEvents } from '../context/EventContext'
import TraceSymbol from '../components/TraceSymbol'
import AddEventModal from '../components/AddEventModal'
import { useState } from 'react'
import './HomePage.css'

export default function HomePage() {
  const navigate = useNavigate()
  const { todayEvents, addEvent } = useEvents()
  const [showModal, setShowModal] = useState(false)

  const handleAdd = (note) => {
    addEvent(note)
    setShowModal(false)
  }

  return (
    <div className="home-page">
      <header className="home-header">
        <button className="header-link" onClick={() => navigate('/today')}>
          <h1 className="home-title">Today's Traces</h1>
          <svg className="title-underline" viewBox="0 0 200 12" preserveAspectRatio="none">
            <path
              d="M2,8 C30,2 50,10 80,6 S130,2 160,8 S190,4 198,7"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          <p className="unlock-count">{todayEvents.length} unlocks</p>
        </button>
      </header>

      <main className="trace-canvas">
        {todayEvents.map((event) => (
          <div
            key={event.id}
            className="trace-symbol"
            style={{
              left: `${event.position.x}%`,
              top: `${event.position.y}%`,
              transform: `rotate(${event.position.rotation}deg) scale(${event.position.scale})`,
            }}
          >
            <TraceSymbol type={event.symbol} size={32} />
          </div>
        ))}
      </main>

      <button
        className="now-button"
        onClick={() => setShowModal(true)}
        aria-label="添加事件"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>

      {showModal && (
        <AddEventModal
          onConfirm={handleAdd}
          onCancel={() => setShowModal(false)}
        />
      )}
    </div>
  )
}
