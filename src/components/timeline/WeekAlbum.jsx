import { useState } from 'react'
import MarkShape from '../MarkShape'
import { useShapePreferences } from '../../context/ShapePreferenceContext'
import './WeekAlbum.css'

/**
 * @typedef {import('../../models/trace').Trace} Trace
 * @typedef {import('../../lib/timeline').AlbumDay} AlbumDay
 * @typedef {import('../../lib/timeline').AlbumEntry} AlbumEntry
 */

const MILESTONE_LABELS = {
  began: 'Began',
  finished: 'Finished',
  paused: 'Set aside',
}

/**
 * @param {{ entry: AlbumEntry, onSelect: (trace: Trace) => void }} props
 */
function AlbumTile({ entry, onSelect }) {
  const { trace, milestone } = entry
  const { getMarkForTrace } = useShapePreferences()
  const [broken, setBroken] = useState(false)
  const hasCover = Boolean(trace.cover) && !broken
  // Albums are square; books and films stand tall.
  const shape = trace.category === 'music' ? 'square' : 'tall'

  return (
    <button
      type="button"
      className={`album-tile album-tile--${hasCover ? shape : 'note'} ${milestone ? 'album-tile--marked' : ''}`}
      onClick={() => onSelect(trace)}
      aria-label={trace.memory}
    >
      {hasCover ? (
        <img src={trace.cover} alt="" loading="lazy" onError={() => setBroken(true)} />
      ) : (
        <span className="album-tile__note">
          <MarkShape type={getMarkForTrace(trace)} size={18} />
          <span className="album-tile__note-title">{trace.memory}</span>
        </span>
      )}
      {milestone && (
        <span className={`album-tile__milestone album-tile__milestone--${milestone}`}>
          {MILESTONE_LABELS[milestone]}
        </span>
      )}
    </button>
  )
}

/**
 * A week laid out like a photo album: the date quietly on the left, what you met on the right.
 * @param {{ days: AlbumDay[], onSelect: (trace: Trace) => void }} props
 */
export default function WeekAlbum({ days, onSelect }) {
  const todayKey = new Date().toDateString()

  return (
    <div className="week-album">
      {days.map(({ date, entries }) => (
        <section key={date.toDateString()} className="album-day">
          <header className="album-day__date">
            <span className="album-day__number">{date.getDate()}</span>
            <span className="album-day__weekday">
              {date.toDateString() === todayKey
                ? 'Today'
                : date.toLocaleDateString('en-US', { weekday: 'short' })}
            </span>
          </header>
          <div className="album-day__shelf">
            {entries.map((entry) => (
              <AlbumTile key={`${entry.trace.id}-${entry.milestone}`} entry={entry} onSelect={onSelect} />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
