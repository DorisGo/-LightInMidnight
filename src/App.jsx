import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import TimelinePage from './pages/TimelinePage'
import BottomNav from './components/BottomNav'

export default function App() {
  return (
    <div className="app-shell">
      <div className="page-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/today" element={<TimelinePage />} />
        </Routes>
      </div>
      <BottomNav />
    </div>
  )
}
