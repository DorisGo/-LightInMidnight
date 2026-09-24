import { useMemo, useState } from 'react'
import TraceThumb from '../trace/TraceThumb'
import { buildMonthCalendar, MAX_LANES } from '../../lib/calendar'
import './CalendarMonth.css'

/**
 * @typedef {import('../../models/trace').Trace} Trace
 * @typedef {import('../../lib/calendar').SpanSegment} SpanSegment
 */

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

/**
 * A lasting trace inside one week: a quiet line, or a ribbon with its title once selected.
 * @param {{ segment: SpanSegment, selected: boolean, onSelect: (trace: Trace) => void }} props
 */
function SpanBar({ segment, selected, onSelect }) {
  const { trace, startCol, endCol, beginsHere, endsHere, lane, sessionCols } = segment
  const length = endCol - startCol + 1
  const status = trace.span?.status ?? 'ongoing'

  const classes = [
    'span-bar',
    `span-bar--${status}`,
    beginsHere && 'span-bar--begins',
    endsHere && 'span-bar--ends',
    selected && 'span-bar--selected',
  ].filter(Boolean).join(' ')

  return (
    <button
      type="button"
      className={classes}
      style={{ gridColumn: `${startCol + 1} / ${endCol + 2}`, gridRow: lane + 2 }}
      onClick={() => onSelect(trace)}
      aria-label={trace.memory}
      aria-pressed={selected}
    >
      <span className="span-bar__line" aria-hidden="true" />
      {selected && (beginsHere || startCol === 0) && (
        <span className="span-bar__label">{trace.memory}</span>
      )}
      {beginsHere && <span className="span-bar__cap span-bar__cap--start" aria-hidden="true" />}
      {endsHere && <span className="span-bar__cap span-bar__cap--end" aria-hidden="true" />}
      {sessionCols.map((col) => (
        <span
          key={col}
          className="span-bar__session"
          style={{ left: `${((col - startCol + 0.5) / length) * 100}%` }}
          aria-hidden="true"
        />
      ))}
    </button>
  )
}

/**
 * @param {{
 *   traces: Trace[],
 *   referenceDate: Date,
 *   selectedKey: string | null,
 *   onSelectDay: (date: Date) => void,
 *   onSelectTrace: (trace: Trace) => void,
 * }} props
 */
export default function CalendarMonth({ traces, referenceDate, selectedKey, onSelectDay, onSelectTrace }) {
  // First tap on a line turns it into a ribbon; a second tap opens it.
  const [selectedSpanId, setSelectedSpanId] = useState(/** @type {string|null} */ (null))

  const handleSpan = (/** @type {Trace} */ trace) => {
    if (selectedSpanId === trace.id) {
      onSelectTrace(trace)
    } else {
      setSelectedSpanId(trace.id)
    }
  }

  const handleDay = (/** @type {Date} */ date) => {
    setSelectedSpanId(null)
    onSelectDay(date)
  }

  const weeks = useMemo(
    () => buildMonthCalendar(traces, referenceDate),
    [traces, referenceDate],
  )

  return (
    <div className="calendar-month">
      <div className="calendar-month__weekdays" aria-hidden="true">
        {WEEKDAYS.map((label, i) => (
          <span key={i}>{label}</span>
        ))}
      </div>

      {weeks.map((week) => (
        <div key={week.key} className="calendar-week">
          {week.days.map((day, col) => (
            <button
              key={day.key}
              type="button"
              className={[
                'calendar-day',
                !day.inMonth && 'calendar-day--outside',
                day.isToday && 'calendar-day--today',
                day.key === selectedKey && 'calendar-day--selected',
              ].filter(Boolean).join(' ')}
              style={{ gridColumn: col + 1 }}
              onClick={() => handleDay(day.date)}
              aria-label={day.date.toDateString()}
            >
              <span className="calendar-day__number">{day.date.getDate()}</span>
            </button>
          ))}

          {week.segments
            .filter((segment) => segment.lane < MAX_LANES)
            .map((segment) => (
              <SpanBar
                key={segment.trace.id}
                segment={segment}
                selected={segment.trace.id === selectedSpanId}
                onSelect={handleSpan}
              />
            ))}

          {week.days.map((day, col) => {
            const extra = Math.max(0, day.moments.length - 2) + day.hiddenSpans
            if (day.moments.length === 0 && day.hiddenSpans === 0) return null

            return (
              <div
                key={`m-${day.key}`}
                className={`calendar-day__moments ${day.inMonth ? '' : 'calendar-day__moments--outside'}`}
                style={{ gridColumn: col + 1 }}
              >
                {day.moments.slice(0, 2).map((trace, i) => (
                  <button
                    key={trace.id}
                    type="button"
                    className={`calendar-day__thumb calendar-day__thumb--${i}`}
                    onClick={() => onSelectTrace(trace)}
                    aria-label={trace.memory}
                  >
                    <TraceThumb trace={trace} width={36} />
                  </button>
                ))}
                {extra > 0 && (
                  <button
                    type="button"
                    className="calendar-day__more"
                    onClick={() => handleDay(day.date)}
                  >
                    +{extra}
                  </button>
                )}
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}
