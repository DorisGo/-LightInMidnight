import { useState } from 'react'
import { storeLocalImage } from '../../lib/localImages'
import './ImageUpload.css'

export default function ImageUpload({ cover, onChange, onBusy }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  async function select(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    setBusy(true)
    onBusy(true)
    setError('')
    try {
      onChange(await storeLocalImage(file))
    } catch (err) {
      setError(err.message?.includes('choose') || err.message?.includes('opened')
        ? err.message : 'Could not save the image on this device. Please try again or free up storage.')
    } finally {
      setBusy(false)
      onBusy(false)
    }
  }
  return (
    <div className="image-upload">
      <label className="image-upload__button">
        {busy ? 'Saving image…' : cover ? 'Change image' : 'Add your own image'}
        <input type="file" accept="image/*" disabled={busy} onChange={select} />
      </label>
      {cover && <button type="button" disabled={busy} onClick={() => onChange(null)}>Remove image</button>}
      <p>Saved on this device. Works offline.</p>
      {error && <p role="alert">{error}</p>}
    </div>
  )
}
