import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { loadAppearance, saveAppearance } from '../models/appearance'

/**
 * @typedef {import('../models/appearance').Appearance} Appearance
 */

const AppearanceContext = createContext(null)

export function AppearanceProvider({ children }) {
  const [appearance, setAppearanceState] = useState(loadAppearance)

  useEffect(() => {
    saveAppearance(appearance)
    const root = document.documentElement
    root.dataset.palette = appearance.palette
    root.dataset.mode = appearance.mode
    root.dataset.sky = appearance.sky
  }, [appearance])

  const setAppearance = useCallback((/** @type {Partial<Appearance>} */ patch) => {
    setAppearanceState((prev) => ({ ...prev, ...patch }))
  }, [])

  return (
    <AppearanceContext.Provider value={{ appearance, setAppearance }}>
      {children}
    </AppearanceContext.Provider>
  )
}

export function useAppearance() {
  const ctx = useContext(AppearanceContext)
  if (!ctx) throw new Error('useAppearance must be used within AppearanceProvider')
  return ctx
}
