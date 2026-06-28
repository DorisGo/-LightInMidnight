import { useState } from 'react'
import './AddEventModal.css'

export default function AddEventModal({ onConfirm, onCancel }) {
  const [note, setNote] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    onConfirm(note.trim())
  }

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">now</h2>
        <form onSubmit={handleSubmit}>
          <textarea
            className="modal-input"
            placeholder="记录此刻…（可选）"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            autoFocus
            rows={3}
          />
          <div className="modal-actions">
            <button type="button" className="modal-btn cancel" onClick={onCancel}>
              取消
            </button>
            <button type="submit" className="modal-btn confirm">
              添加
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
