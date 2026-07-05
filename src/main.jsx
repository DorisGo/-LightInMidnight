import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { TraceProvider } from './context/TraceContext'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <TraceProvider>
        <App />
      </TraceProvider>
    </BrowserRouter>
  </StrictMode>,
)
