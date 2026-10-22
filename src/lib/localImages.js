const PREFIX = 'local-image:'

export const isLocalImage = (value) => value?.startsWith(PREFIX)

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('light-in-midnight-images', 1)
    request.onupgradeneeded = () => request.result.createObjectStore('images')
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

async function transact(mode, operation) {
  const db = await openDatabase()
  try {
    return await new Promise((resolve, reject) => {
      const transaction = db.transaction('images', mode)
      const request = operation(transaction.objectStore('images'))
      transaction.oncomplete = () => resolve(request.result)
      transaction.onerror = (event) => reject(event.target.error || transaction.error || new Error('Could not save this image.'))
      transaction.onabort = () => reject(transaction.error || new Error('Image storage interrupted'))
    })
  } finally {
    db.close()
  }
}

// Decode and copy the pixels before persisting: never depend on a photo picker File's backing store.
// This also bounds photo dimensions and strips camera metadata from the stored copy.
export async function storeLocalImage(file, onPreview) {
  if (file.type && !file.type.startsWith('image/')) throw new Error('Please choose an image.')
  if (file.size > 20 * 1024 * 1024) throw new Error('Please choose an image smaller than 20 MB.')
  const preview = URL.createObjectURL(file)
  let blob
  try {
    const image = await new Promise((resolve, reject) => {
      const image = new Image()
      image.onload = () => resolve(image)
      image.onerror = () => reject(new Error('This image cannot be opened. Try a photo downloaded to your device, or JPEG / PNG.'))
      image.src = preview
    })
    const scale = Math.min(1, 1920 / Math.max(image.naturalWidth, image.naturalHeight))
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale))
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale))
    const context = canvas.getContext('2d')
    if (!context) throw new Error('Could not prepare this image. Please try again.')
    context.drawImage(image, 0, 0, canvas.width, canvas.height)
    blob = await new Promise((resolve, reject) => {
      canvas.toBlob((result) => result ? resolve(result) : reject(new Error('Could not prepare this image. Please try again.')),
        file.type === 'image/png' ? 'image/png' : 'image/jpeg', 0.88)
    })
  } finally {
    URL.revokeObjectURL(preview)
  }
  onPreview?.(blob)
  const id = crypto.randomUUID()
  // WebKit may fail to clone Blob/File backing data while offline. Persist plain bytes instead.
  const bytes = await blob.arrayBuffer()
  await transact('readwrite', (store) => store.put({ bytes, type: blob.type }, id))
  return PREFIX + id
}

export async function loadLocalImage(reference) {
  const stored = await transact('readonly', (store) => store.get(reference.slice(PREFIX.length)))
  // Keep previously saved Blob/File images readable without migrating or deleting data.
  if (!stored || stored instanceof Blob) return stored
  return new Blob([stored.bytes], { type: stored.type })
}
