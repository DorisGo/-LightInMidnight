import './TimelineHeader.css'

/**
 * @param {{ periodTitle: string }} props
 */
export default function TimelineHeader({ periodTitle }) {
  return (
    <header className="timeline-header">
      <h1 className="timeline-header__title">Timeline</h1>
      <p className="timeline-header__period">{periodTitle}</p>
    </header>
  )
}
