import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import TodayPage from './pages/TodayPage'
import TimelinePage from './pages/TimelinePage'
import EditTracePage from './pages/EditTracePage'
import SettingsPage from './pages/SettingsPage'

export default function App() {
  return (
    <div className="app-shell">
      <div className="page-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/today" element={<TodayPage />} />
          <Route path="/timeline" element={<TimelinePage />} />
          <Route path="/trace/:id/edit" element={<EditTracePage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </div>
    </div>
  )
}
