import { useEffect, useState, useRef } from 'react'
import { isLocalImage, loadLocalImage } from '../../lib/localImages'

export default function CoverImage({ src, onError, ...props }) {
  const [resolved, setResolved] = useState(null)
  const errorRef = useRef(onError)
  errorRef.current = onError
  useEffect(() => {
    if (!isLocalImage(src)) return
    let active = true
    let url
    setResolved(null)
    loadLocalImage(src).then((blob) => {
      if (!active) return
      if (!blob) throw new Error('Missing local image')
      url = URL.createObjectURL(blob)
      setResolved({ source: src, url })
    }).catch(() => { if (active) errorRef.current?.() })
    return () => {
      active = false
      if (url) URL.revokeObjectURL(url)
    }
  }, [src])
  const url = isLocalImage(src) ? (resolved?.source === src ? resolved.url : undefined) : src
  return <img {...props} src={url} onError={onError} />
}
