import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { TraceProvider } from './context/TraceContext'
import { ShapePreferenceProvider } from './context/ShapePreferenceContext'
import { AppearanceProvider } from './context/AppearanceContext'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AppearanceProvider>
        <TraceProvider>
          <ShapePreferenceProvider>
            <App />
          </ShapePreferenceProvider>
        </TraceProvider>
      </AppearanceProvider>
    </BrowserRouter>
  </StrictMode>,
)
