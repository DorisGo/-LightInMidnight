import { readFileSync } from 'node:fs'
import { test, expect } from '@playwright/test'

const image = {
  name: 'photo.png', mimeType: 'image/png',
  buffer: readFileSync(new URL('../public/pwa-64x64.png', import.meta.url)),
}

async function openOffline(page, context) {
  await page.goto('/')
  await page.evaluate(() => navigator.serviceWorker.ready.then(() => true))
  await page.reload()
  await context.setOffline(true)
  await page.getByRole('button', { name: 'Leave a trace', exact: true }).click()
}

async function expectDecoded(locator) {
  await expect(locator).toBeVisible()
  await expect.poll(() => locator.evaluate(el => el.naturalWidth)).toBeGreaterThan(0)
}

const stored = page => page.evaluate(() => JSON.parse(localStorage.getItem('light-in-midnight-traces') || '[]'))

test('offline photo-first preview, direct save and persistent replacement', async ({ page, context }) => {
  const errors = []
  page.on('pageerror', err => errors.push(err.message))
  await openOffline(page, context)
  await expect(page.getByText('You’re offline.', { exact: false })).toBeVisible()
  const chooser = page.waitForEvent('filechooser')
  await page.getByText('Add your own image', { exact: true }).click()
  await (await chooser).setFiles(image)
  // Preview must work before selecting a catalog result or confirming the title.
  await expectDecoded(page.locator('.image-upload__preview'))
  await page.getByPlaceholder('A book, a film, a song, a walk…').fill('Offline photo')
  await page.locator('.quick-add__save').click()
  await expect.poll(async () => (await stored(page)).length).toBe(1)
  const [trace] = await stored(page)
  expect(trace.cover).toMatch(/^local-image:/)
  // Storage must contain independent encoded pixels, not a File tied to the picker.
  const type = await page.evaluate(async reference => {
    const db = await new Promise((resolve, reject) => {
      const r = indexedDB.open('light-in-midnight-images', 1)
      r.onsuccess = () => resolve(r.result)
      r.onerror = () => reject(r.error)
    })
    try {
      return await new Promise((resolve, reject) => {
        const r = db.transaction('images').objectStore('images').get(reference.slice('local-image:'.length))
        r.onsuccess = () => resolve({ bytes: r.result.bytes instanceof ArrayBuffer, type: r.result.type })
        r.onerror = () => reject(r.error)
      })
    } finally { db.close() }
  }, trace.cover)
  expect(type).toEqual({ bytes: true, type: 'image/png' })
  await page.reload()
  await page.goto(`/trace/${trace.id}/edit`)
  await expectDecoded(page.locator('.trace-form__cover'))
  await page.locator('input[type=file]').setInputFiles({ ...image, name: 'replacement.png' })
  await expect(page.getByText('Image saved on this device. Works offline.', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Save', exact: true }).click()
  await expect.poll(async () => (await stored(page))[0].cover).not.toBe(trace.cover)
  await expect(page).not.toHaveURL(/\/edit$/)
  await page.goto(`/trace/${trace.id}/edit`)
  await expectDecoded(page.locator('.trace-form__cover'))
  expect(errors).toEqual([])
})

test('offline storage failure preserves the previous image and allows retry', async ({ page, context }) => {
  await openOffline(page, context)
  await page.locator('input[type=file]').setInputFiles(image)
  await expectDecoded(page.locator('.image-upload__preview'))
  await page.getByText('Image saved on this device. Works offline.', { exact: true }).waitFor()
  const previous = await page.evaluate(async () => {
    const db = await new Promise(resolve => {
      const request = indexedDB.open('light-in-midnight-images', 1)
      request.onsuccess = () => resolve(request.result)
    })
    try {
      return await new Promise(resolve => {
        const request = db.transaction('images').objectStore('images').getAllKeys()
        request.onsuccess = () => resolve('local-image:' + request.result[0])
      })
    } finally { db.close() }
  })
  await page.evaluate(() => {
    window.originalImagePut = IDBObjectStore.prototype.put
    IDBObjectStore.prototype.put = () => { throw new DOMException('Storage full', 'QuotaExceededError') }
  })
  await page.locator('input[type=file]').setInputFiles(image)
  await expect(page.getByRole('alert')).toContainText('Could not save the image')
  await expectDecoded(page.locator('.image-upload__preview'))
  await expect(page.locator('input[type=file]')).toBeEnabled()
  await page.getByPlaceholder('A book, a film, a song, a walk…').fill('Keep the original')
  await page.locator('.quick-add__save').click()
  await expect.poll(async () => (await stored(page))[0]?.cover).toBe(previous)
  await page.evaluate(() => { IDBObjectStore.prototype.put = window.originalImagePut })
  const [trace] = await stored(page)
  await page.goto(`/trace/${trace.id}/edit`)
  await page.locator('input[type=file]').setInputFiles(image)
  await expect(page.getByText('Image saved on this device. Works offline.', { exact: true })).toBeVisible()
  await expect(page.getByRole('alert')).toHaveCount(0)
})
