import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import {
  loadShapePreferences,
  saveShapePreferences,
  getMarkForTrace as resolveMarkForTrace,
  getPreviewMarkForCategory,
} from '../models/shapePreferences'

/**
 * @typedef {import('../models/shapePreferences').ShapePreference} ShapePreference
 * @typedef {import('../models/trace').TraceCategory} TraceCategory
 * @typedef {import('../models/trace').Trace} Trace
 */

const ShapePreferenceContext = createContext(null)

export function ShapePreferenceProvider({ children }) {
  const [preferences, setPreferences] = useState(loadShapePreferences)

  useEffect(() => {
    saveShapePreferences(preferences)
  }, [preferences])

  const setCategoryPreference = useCallback((category, shape) => {
    setPreferences((prev) => ({
      ...prev,
      [category]: shape,
    }))
  }, [])

  const getMarkForTrace = useCallback(
    (trace) => resolveMarkForTrace(trace, preferences),
    [preferences],
  )

  const getCategoryPreviewMark = useCallback(
    (category) => getPreviewMarkForCategory(category, preferences),
    [preferences],
  )

  return (
    <ShapePreferenceContext.Provider
      value={{ preferences, setCategoryPreference, getMarkForTrace, getCategoryPreviewMark }}
    >
      {children}
    </ShapePreferenceContext.Provider>
  )
}

export function useShapePreferences() {
  const ctx = useContext(ShapePreferenceContext)
  if (!ctx) throw new Error('useShapePreferences must be used within ShapePreferenceProvider')
  return ctx
}
