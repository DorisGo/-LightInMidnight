import Companions from './Companions'
import ClockDial from './ClockDial'
import './ClockSkyHome.css'

/**
 * Direction A — the clock is the sky, with what keeps you company resting below it.
 */

/**
 * @typedef {import('../../models/trace').Trace} Trace
 */

/**
 * @param {{
 *   traces: Trace[],
 *   companions: Trace[],
 *   marked: Set<string>,
 *   now: Date,
 *   landingId: string | null,
 *   showHint: boolean,
 *   onAdd: () => void,
 *   onToggle: (trace: Trace) => void,
 *   onSelect: (trace: Trace) => void,
 * }} props
 */
export default function ClockSkyHome({ traces, companions, marked, now, landingId, showHint, onAdd, onToggle, onSelect }) {
  return (
    <div className="clock-home">
      <header className="clock-home__header">
        <p className="clock-home__date">
          {now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </header>

      <div className="clock-home__stage">
        <ClockDial traces={traces} now={now} landingId={landingId} onAdd={onAdd} onSelect={onSelect} />
        {showHint && <p className="clock-home__hint">tap the time to leave a trace</p>}
      </div>

      <section className="clock-home__companions">
        <p className="clock-home__companions-label">still with you</p>
        <Companions traces={companions} marked={marked} onToggle={onToggle} />
      </section>
    </div>
  )
}
