import './TimelineHeader.css'

/**
 * @param {{ periodTitle: string, onPrev?: () => void, onNext?: () => void }} props
 */
export default function TimelineHeader({ periodTitle, onPrev, onNext }) {
  return (
    <header className="timeline-header">
      <h1 className="timeline-header__title">Timeline</h1>
      <div className="timeline-header__period-row">
        {onPrev && (
          <button type="button" className="timeline-header__step" onClick={onPrev} aria-label="Previous">
            ‹
          </button>
        )}
        <p className="timeline-header__period">{periodTitle}</p>
        {onNext && (
          <button type="button" className="timeline-header__step" onClick={onNext} aria-label="Next">
            ›
          </button>
        )}
      </div>
    </header>
  )
}
