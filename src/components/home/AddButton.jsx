import { useState } from 'react'
import AddEventModal from '../AddEventModal'
import './AddButton.css'

export default function AddButton({ onAdd }) {
  const [showModal, setShowModal] = useState(false)

  const handleConfirm = (note) => {
    onAdd(note)
    setShowModal(false)
  }

  return (
    <>
      <button
        className="now-button"
        onClick={() => setShowModal(true)}
        aria-label="添加事件"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>

      {showModal && (
        <AddEventModal
          onConfirm={handleConfirm}
          onCancel={() => setShowModal(false)}
        />
      )}
      {/* TODO: haptic feedback or subtle pulse on successful add */}
    </>
  )
}
