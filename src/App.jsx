import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import TimelinePage from './pages/TimelinePage'

export default function App() {
  return (
    <div className="app-shell">
      <div className="page-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/timeline" element={<TimelinePage />} />
          <Route path="/today" element={<TimelinePage />} />
        </Routes>
      </div>
    </div>
  )
}
