import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@/styles/globals.css'
import App from './App'

const routeTitles: Record<string, string> = {
  '/viewer': 'JSON Workspace | Viewer',
  '/formatter': 'JSON Workspace | Formatter',
  '/compare': 'JSON Workspace | Compare',
  '/validator': 'JSON Workspace | Validator',
  '/corrector': 'JSON Workspace | Corrector',
}

const root = document.getElementById('root')
if (!root) throw new Error('Root element not found')

const updateTitle = () => {
  const path = window.location.hash.replace('#', '') || '/viewer'
  const route = path.split('?')[0]
  document.title = routeTitles[route] ?? 'JSON Workspace - Fast JSON Developer Toolbox'
}

window.addEventListener('hashchange', updateTitle)
updateTitle()

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>
)
