import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// iOS Safari only shows :active (pressed) styles when some touch listener is registered.
document.addEventListener('touchstart', () => {}, { passive: true })
