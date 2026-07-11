import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/global.css'
import App from './App'
import { StoreProvider } from './state/store'
import { initInstallCapture } from './lib/install'

// Catch the browser's install offer before first render so the
// "Install app" button can fire the real one-tap prompt.
initInstallCapture()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StoreProvider>
      <App />
    </StoreProvider>
  </StrictMode>,
)

// Installable app (PWA): register the conservative service worker in
// production builds only, so `vite dev` never fights a cached shell.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {})
  })
}
