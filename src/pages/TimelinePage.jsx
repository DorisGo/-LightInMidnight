import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTraces } from '../context/TraceContext'
import BottomNavigation from '../components/home/BottomNavigation'
import TracePreview from '../components/home/TracePreview'
import TimelineHeader from '../components/timeline/TimelineHeader'
import TimelineSwitcher from '../components/timeline/TimelineSwitcher'
import TimelineGroup from '../components/timeline/TimelineGroup'
import CalendarMonth from '../components/timeline/CalendarMonth'
import YearStarMap from '../components/timeline/YearStarMap'
import WeekAlbum from '../components/timeline/WeekAlbum'
import { getPeriodTitle, groupTraces, shiftPeriod, buildWeekAlbum } from '../lib/timeline'
import { tracesOnDay } from '../lib/calendar'
import { getTimelineFocusForTrace } from '../lib/tracePreview'
import { toDateInputValue } from '../models/trace'
import './TimelinePage.css'

/**
 * @typedef {import('../lib/timeline').TimelineMode} TimelineMode
 * @typedef {import('../models/trace').Trace} Trace
 */

export default function TimelinePage() {
  const { traces } = useTraces()
  const [searchParams] = useSearchParams()
  const focusId = searchParams.get('trace')
  const focusTrace = focusId ? traces.find((trace) => trace.id === focusId) : null
  const focus = focusTrace ? getTimelineFocusForTrace(focusTrace) : null

  const [mode, setMode] = useState(/** @type {TimelineMode} */ (focus?.mode ?? 'calendar'))
  const [referenceDate, setReferenceDate] = useState(() => focus?.referenceDate ?? new Date())
  const [selectedDay, setSelectedDay] = useState(() => new Date())
  const [previewTrace, setPreviewTrace] = useState(/** @type {Trace|null} */ (null))

  // Arriving from a trace's "Timeline" link while already on this page.
  useEffect(() => {
    if (!focus) return
    setMode(focus.mode)
    setReferenceDate(focus.referenceDate)
    setPreviewTrace(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusId])

  const periodTitle = useMemo(
    () => getPeriodTitle(mode, referenceDate),
    [mode, referenceDate],
  )
  const groups = useMemo(
    () => groupTraces(traces, mode, referenceDate),
    [traces, mode, referenceDate],
  )
  const hasVisibleGroups = groups.some((group) => group.traces.length > 0)
  const albumDays = useMemo(
    () => (mode === 'week' ? buildWeekAlbum(traces, referenceDate) : []),
    [traces, mode, referenceDate],
  )

  const selectedKey = toDateInputValue(selectedDay)
  const selectedDayLabel = selectedDay.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
  const dayTraces = useMemo(
    () => tracesOnDay(traces, selectedDay),
    [traces, selectedDay],
  )

  const step = (/** @type {-1 | 1} */ direction) => {
    const next = shiftPeriod(mode, referenceDate, direction)
    setReferenceDate(next)
    if (mode === 'calendar') setSelectedDay(next)
  }

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
      <TimelineHeader
        periodTitle={periodTitle}
        onPrev={() => step(-1)}
        onNext={() => step(1)}
      />
      <TimelineSwitcher mode={mode} onModeChange={setMode} />

      <div className="timeline-page__content">
        {mode === 'calendar' ? (
          <>
            <CalendarMonth
              traces={traces}
              referenceDate={referenceDate}
              selectedKey={selectedKey}
              onSelectDay={setSelectedDay}
              onSelectTrace={setPreviewTrace}
            />
            <div className="timeline-day">
              {dayTraces.length > 0 ? (
                <TimelineGroup
                  label={selectedDayLabel}
                  traces={dayTraces}
                  onSelect={setPreviewTrace}
                />
              ) : (
                <p className="timeline-day__empty">{selectedDayLabel} · A quiet day.</p>
              )}
            </div>
          </>
        ) : mode === 'year' ? (
          <>
            <YearStarMap
              traces={traces}
              year={referenceDate.getFullYear()}
              onSelect={setPreviewTrace}
            />
            {groups.map((group) => (
              <TimelineGroup
                key={group.key}
                label={group.label}
                traces={group.traces}
                highlightId={focusId}
                onSelect={setPreviewTrace}
              />
            ))}
          </>
        ) : mode === 'week' ? (
          albumDays.length > 0 ? (
            <WeekAlbum days={albumDays} onSelect={setPreviewTrace} />
          ) : (
            <div className="timeline-empty">
              <p className="timeline-empty__title">A quiet week.</p>
              <p className="timeline-empty__hint">Nothing left here yet.</p>
            </div>
          )
        ) : traces.length === 0 ? (
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
              onSelect={setPreviewTrace}
            />
          ))
        )}
      </div>

      {previewTrace && (
        <TracePreview trace={previewTrace} onClose={() => setPreviewTrace(null)} />
      )}

      <BottomNavigation />
    </div>
  )
}
