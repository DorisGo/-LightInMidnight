import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTraces } from '../context/TraceContext'
import BottomNavigation from '../components/home/BottomNavigation'
import TimelineHeader from '../components/timeline/TimelineHeader'
import TimelineSwitcher from '../components/timeline/TimelineSwitcher'
import TimelineGroup from '../components/timeline/TimelineGroup'
import { getPeriodTitle, groupTraces } from '../lib/timeline'
import { getTimelineFocusForTrace } from '../lib/tracePreview'
import './TimelinePage.css'

/** @typedef {'week' | 'month' | 'year'} TimelineMode */

export default function TimelinePage() {
  const { traces } = useTraces()
  const [searchParams] = useSearchParams()
  const focusId = searchParams.get('trace')
  const focusTrace = focusId ? traces.find((trace) => trace.id === focusId) : null
  const focus = focusTrace ? getTimelineFocusForTrace(focusTrace) : null

  const [mode, setMode] = useState(/** @type {TimelineMode} */ (focus?.mode ?? 'month'))
  const referenceDate = focus?.referenceDate ?? new Date()

  const periodTitle = useMemo(
    () => getPeriodTitle(mode, referenceDate),
    [mode, referenceDate],
  )
  const groups = useMemo(
    () => groupTraces(traces, mode, referenceDate),
    [traces, mode, referenceDate],
  )
  const hasVisibleGroups = groups.some((group) => group.traces.length > 0)

  useEffect(() => {
    if (!focusId) return

    const timer = window.setTimeout(() => {
      document.getElementById(`timeline-trace-${focusId}`)?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    }, 100)

    return () => window.clearTimeout(timer)
  }, [focusId, groups])

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
              highlightId={focusId}
            />
          ))
        )}
      </div>

      <BottomNavigation />
    </div>
  )
}
