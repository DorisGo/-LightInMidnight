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
      transaction.onerror = () => reject(transaction.error)
      transaction.onabort = () => reject(transaction.error || new Error('Image storage interrupted'))
    })
  } finally {
    db.close()
  }
}

export async function storeLocalImage(file) {
  if (!file.type.startsWith('image/')) throw new Error('Please choose an image.')
  if (file.size > 20 * 1024 * 1024) throw new Error('Please choose an image smaller than 20 MB.')
  const preview = URL.createObjectURL(file)
  try {
    await new Promise((resolve, reject) => {
      const image = new Image()
      image.onload = resolve
      image.onerror = () => reject(new Error('This image cannot be opened. Try JPEG or PNG.'))
      image.src = preview
    })
  } finally {
    URL.revokeObjectURL(preview)
  }
  const id = crypto.randomUUID()
  await transact('readwrite', (store) => store.put(file, id))
  return PREFIX + id
}

export function loadLocalImage(reference) {
  return transact('readonly', (store) => store.get(reference.slice(PREFIX.length)))
}
