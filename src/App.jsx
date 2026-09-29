import { Routes, Route, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import TodayPage from './pages/TodayPage'
import TimelinePage from './pages/TimelinePage'
import EditTracePage from './pages/EditTracePage'
import SettingsPage from './pages/SettingsPage'
import ThemeLabPage from './lab/ThemeLabPage'
import QuickAddLab from './lab/QuickAddLab'

export default function App() {
  const location = useLocation()

  // The design lab needs the full window, outside the phone-width shell.
  if (location.pathname === '/lab') return <ThemeLabPage />
  if (location.pathname === '/lab/add') return <QuickAddLab />

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
