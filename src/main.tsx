import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import { initializeStability } from './utils/stability'
import { logger } from './utils/logger'

// Initialize stability features
initializeStability()

// Log application startup
logger.info('React app starting', 'MAIN')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
