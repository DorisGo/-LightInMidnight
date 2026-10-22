import CoverImage from './CoverImage'
import { useEffect, useRef, useState } from 'react'
import { storeLocalImage } from '../../lib/localImages'
import './ImageUpload.css'

export default function ImageUpload({ cover, onChange, onBusy, showPreview = true }) {
  const [busy, setBusy] = useState(false)
  const [preview, setPreview] = useState(null)
  const previewRef = useRef(null)
  const mounted = useRef(true)
  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
      if (previewRef.current) URL.revokeObjectURL(previewRef.current)
    }
  }, [])
  function clearPreview() {
    if (previewRef.current) URL.revokeObjectURL(previewRef.current)
    previewRef.current = null
    setPreview(null)
  }
  const [error, setError] = useState('')
  useEffect(() => { clearPreview() }, [cover])
  async function select(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    setBusy(true)
    onBusy(true)
    setError('')
    try {
      const reference = await storeLocalImage(file, (blob) => {
        if (!mounted.current) return
        previewRef.current = URL.createObjectURL(blob)
        setPreview(previewRef.current)
      })
      if (mounted.current) onChange(reference)
    } catch (err) {
      if (!mounted.current) return
      clearPreview()
      setError(err?.message?.includes('choose') || err?.message?.includes('opened') || err?.message?.includes('prepare')
        ? err?.message : 'Could not save the image on this device. Please try again or free up storage.')
    } finally {
      if (mounted.current) {
        setBusy(false)
        onBusy(false)
      }
    }
  }
  return (
    <div className="image-upload">
      {showPreview && (preview || cover) && <CoverImage className="image-upload__preview" src={preview || cover} alt="Selected image" />}
      <label className="image-upload__button">
        {busy ? 'Saving image…' : cover ? 'Change image' : 'Add your own image'}
        <input type="file" accept="image/*" disabled={busy} onChange={select} />
      </label>
      {cover && <button type="button" disabled={busy} onClick={() => { clearPreview(); onChange(null) }}>Remove image</button>}
      <p role="status">{busy ? 'Saving image on this device…' : cover ? 'Image saved on this device. Works offline.' : 'Works offline with photos already downloaded to this device.'}</p>
      {error && <p role="alert">{error}</p>}
    </div>
  )
}
