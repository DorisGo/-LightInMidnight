import { useState } from 'react'
import TraceForm from '../trace/TraceForm'
import './AddTraceFlow.css'

function formatNowTime(date) {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

export default function AddTraceFlow({ step, onStepChange, onComplete, onDismiss }) {
  const [capturedAt] = useState(() => new Date())

  if (step === 'pause') {
    return (
      <div className="add-trace-flow add-trace-flow--pause">
        <button
          type="button"
          className="add-trace-flow__dismiss"
          onClick={onDismiss}
          aria-label="返回"
        />

        <div className="add-trace-flow__paper-wrap add-trace-flow__paper-wrap--pause">
          <svg
            className="add-trace-flow__paper-svg"
            viewBox="0 0 320 260"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              className="add-trace-flow__paper-border"
              d="M 14 18
                 C 42 10, 78 22, 118 14
                 S 198 8, 248 16
                 S 292 12, 306 24
                 L 310 58
                 C 314 98, 308 138, 312 178
                 L 306 218
                 C 288 238, 228 232, 168 236
                 S 68 240, 28 228
                 L 12 188
                 C 8 148, 10 108, 14 68
                 Z"
            />
            <path className="add-trace-flow__crease" d="M 36 72 Q 108 98 196 64 T 284 88" />
            <path className="add-trace-flow__crease" d="M 48 148 Q 132 124 210 156 T 296 138" />
            <path className="add-trace-flow__crease" d="M 72 44 L 118 108" />
            <path className="add-trace-flow__crease" d="M 228 52 L 186 118" />
            <path className="add-trace-flow__crease add-trace-flow__crease--fold" d="M 252 24 L 268 48 L 244 56 Z" />
          </svg>

          <div className="add-trace-flow__paper add-trace-flow__paper--pause">
            <div className="add-trace-flow__content">
              <h2 className="add-trace-flow__title">now</h2>
              <p className="add-trace-flow__time">{formatNowTime(capturedAt)}</p>

              <button
                type="button"
                className="add-trace-flow__leave-link"
                onClick={() => onStepChange('entry')}
              >
                Leave a Trace.
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="add-trace-flow add-trace-flow--entry">
      <TraceForm
        heading="Leave a Trace."
        onBack={() => onStepChange('pause')}
        onSubmit={(input) => onComplete({ ...input, recordedAt: new Date() })}
      />
    </div>
  )
}
