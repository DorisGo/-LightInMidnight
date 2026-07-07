import BottomNavigation from '../components/home/BottomNavigation'
import SettingsHeader from '../components/settings/SettingsHeader'
import ShapePreferencesSection from '../components/settings/ShapePreferencesSection'
import './SettingsPage.css'

export default function SettingsPage() {
  return (
    <div className="settings-page">
      <SettingsHeader />
      <div className="settings-page__content">
        <ShapePreferencesSection />
      </div>
      <BottomNavigation />
    </div>
  )
}
