import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

// Fonts are bundled rather than fetched from Google, so they are same-origin,
// cached by the service worker, and therefore present when playing offline.
import '@fontsource/outfit/latin-400.css'
import '@fontsource/outfit/latin-600.css'
import '@fontsource/outfit/latin-700.css'
import '@fontsource/fraunces/latin-600.css'
import '@fontsource/fraunces/latin-900.css'

import './styles.css'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

// Offline support. Registered only in production so it never shadows the dev
// server's module graph.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {
      // Offline play is a bonus; the game works fine without it.
    })
  })
}
