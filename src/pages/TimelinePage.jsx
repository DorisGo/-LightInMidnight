import { useMemo, useState } from 'react'
import { useTraces } from '../context/TraceContext'
import BottomNavigation from '../components/home/BottomNavigation'
import TimelineHeader from '../components/timeline/TimelineHeader'
import TimelineSwitcher from '../components/timeline/TimelineSwitcher'
import TimelineGroup from '../components/timeline/TimelineGroup'
import { getPeriodTitle, groupTraces } from '../lib/timeline'
import './TimelinePage.css'

/** @typedef {'week' | 'month' | 'year'} TimelineMode */

export default function TimelinePage() {
  const { traces } = useTraces()
  const [mode, setMode] = useState(/** @type {TimelineMode} */ ('month'))

  const periodTitle = useMemo(() => getPeriodTitle(mode), [mode])
  const groups = useMemo(() => groupTraces(traces, mode), [traces, mode])
  const hasVisibleGroups = groups.some((group) => group.traces.length > 0)

  return (
    <div className="timeline-page">
      <TimelineHeader periodTitle={periodTitle} />
      <TimelineSwitcher mode={mode} onModeChange={setMode} />

      <div className="timeline-page__content">
        {traces.length === 0 ? (
          <div className="timeline-empty">
            <p className="timeline-empty__title">No traces yet.</p>
            <p className="timeline-empty__hint">Leave your first trace.</p>
          </div>
        ) : !hasVisibleGroups ? (
          <div className="timeline-empty">
            <p className="timeline-empty__title">No traces in this period.</p>
            <p className="timeline-empty__hint">Try another view, or leave a new trace.</p>
          </div>
        ) : (
          groups.map((group) => (
            <TimelineGroup
              key={group.key}
              label={group.label}
              traces={group.traces}
            />
          ))
        )}
      </div>

      <BottomNavigation />
    </div>
  )
}
