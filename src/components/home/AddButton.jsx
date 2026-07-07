import { useState } from 'react'
import { useTraces } from '../../context/TraceContext'
import AddTraceFlow from './AddTraceFlow'
import './AddButton.css'

export default function AddButton() {
  const { addTrace } = useTraces()
  const [flowOpen, setFlowOpen] = useState(false)
  const [step, setStep] = useState('pause')

  const handleOpen = () => {
    setStep('pause')
    setFlowOpen(true)
  }

  const handleClose = () => {
    setFlowOpen(false)
    setStep('pause')
  }

  const handleComplete = (input) => {
    addTrace(input)
    handleClose()
  }

  return (
    <>
      {flowOpen && (
        <AddTraceFlow
          step={step}
          onStepChange={setStep}
          onComplete={handleComplete}
          onDismiss={handleClose}
        />
      )}

      {!flowOpen && (
        <button
          className="now-button"
          onClick={handleOpen}
          aria-label="留下痕迹"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      )}
    </>
  )
}
