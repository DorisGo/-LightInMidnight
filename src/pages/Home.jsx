import { useMemo, useState } from 'react'
import { useTraces } from '../context/TraceContext'
import { useAppearance } from '../context/AppearanceContext'
import MixedHome from '../lab/home/MixedHome'
import { useNow } from '../lab/home/useNow'
import QuickAddSheet from '../components/add/QuickAddSheet'
import TracePreview from '../components/home/TracePreview'
import BottomNavigation from '../components/home/BottomNavigation'
import { companions as pickCompanions } from '../models/companions'
import { toDateInputValue } from '../models/trace'
import './Home.css'

/**
 * @typedef {import('../models/trace').Trace} Trace
 */

const HINT_KEY = 'light-in-midnight-home-hint-seen'

function hintSeen() {
  try {
    return localStorage.getItem(HINT_KEY) === '1'
  } catch {
    return false
  }
}

/** Home is "now": a 24-hour dial of today and the days before, and what keeps you company. */
export default function Home() {
  const { traces, addTrace, toggleSession } = useTraces()
  const { appearance } = useAppearance()
  const now = useNow()
  const todayKey = toDateInputValue(now)

  const [sheetOpen, setSheetOpen] = useState(false)
  const [landingId, setLandingId] = useState(/** @type {string|null} */ (null))
  const [showHint, setShowHint] = useState(() => !hintSeen())
  const [preview, setPreview] = useState(/** @type {Trace|null} */ (null))

  const companions = useMemo(() => pickCompanions(traces), [traces])
  const ongoing = useMemo(() => traces.filter((trace) => trace.span?.status === 'ongoing'), [traces])
  // "With it today" means today is one of the span's sessions.
  const marked = useMemo(
    () => new Set(traces.filter((trace) => trace.span?.sessions.includes(todayKey)).map((trace) => trace.id)),
    [traces, todayKey],
  )

  const open = () => {
    if (showHint) {
      setShowHint(false)
      try {
        localStorage.setItem(HINT_KEY, '1')
      } catch {
        // Private mode: the hint just comes back next time.
      }
    }
    setSheetOpen(true)
  }

  const save = (/** @type {Omit<import('../models/trace').TraceInput, 'recordedAt'>} */ input) => {
    setSheetOpen(false)
    // Let the sheet slide away before the new star lands where the hand points.
    window.setTimeout(() => {
      const trace = addTrace({ ...input, recordedAt: new Date() })
      setLandingId(trace.id)
      window.setTimeout(() => setLandingId(null), 1800)
    }, 260)
  }

  // Books can be marked "today too"; anything else just opens, since it has no days to count.
  const toggle = (/** @type {Trace} */ trace) => {
    if (trace.span) toggleSession(trace.id, todayKey)
    else setPreview(trace)
  }

  return (
    <div className="home-page">
      <div className="home-page__sky home-frame" data-mode={appearance.mode}>
        <MixedHome
          traces={traces}
          companions={companions}
          marked={marked}
          now={now}
          landingId={landingId}
          showHint={showHint}
          onAdd={open}
          onToggle={toggle}
          onSelect={setPreview}
        />
      </div>
      <BottomNavigation />

      {sheetOpen && (
        <QuickAddSheet
          ongoing={ongoing}
          sessionKeys={marked}
          onSession={(trace) => toggleSession(trace.id, todayKey)}
          onSave={save}
          onClose={() => setSheetOpen(false)}
        />
      )}

      {preview && <TracePreview trace={preview} onClose={() => setPreview(null)} />}
    </div>
  )
}
