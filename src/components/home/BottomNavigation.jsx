import { useNavigate, useLocation } from 'react-router-dom'
import './BottomNavigation.css'

function HomeIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 10 L11 3 L19 10" />
      <path d="M5 9 V19 H17 V9" />
      {active && <line x1="3" y1="19" x2="19" y2="19" />}
    </svg>
  )
}

function StatsIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <line x1="4" y1="18" x2="4" y2="10" />
      <line x1="11" y1="18" x2="11" y2="4" />
      <line x1="18" y1="18" x2="18" y2="13" />
    </svg>
  )
}

function SettingsIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <circle cx="11" cy="11" r="3" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
        const rad = (deg * Math.PI) / 180
        const x1 = 11 + Math.cos(rad) * 5.5
        const y1 = 11 + Math.sin(rad) * 5.5
        const x2 = 11 + Math.cos(rad) * 9
        const y2 = 11 + Math.sin(rad) * 9
        return <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2} />
      })}
    </svg>
  )
}

export default function BottomNavigation() {
  const navigate = useNavigate()
  const location = useLocation()
  const isHome = location.pathname === '/'

  return (
    <nav className="bottom-nav">
      <button
        className={`nav-item ${isHome ? 'active' : ''}`}
        onClick={() => navigate('/')}
        aria-label="home"
      >
        <HomeIcon active={isHome} />
        <span>home</span>
      </button>
      <button className="nav-item" aria-label="stats" disabled>
        <StatsIcon />
        <span>stats</span>
      </button>
      <button className="nav-item" aria-label="settings" disabled>
        <SettingsIcon />
        <span>settings</span>
      </button>
      {/* TODO: wire stats and settings routes */}
    </nav>
  )
}
