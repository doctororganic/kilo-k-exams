import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import { initializeStability } from './utils/stability'
import { initializeMonitoring } from './utils/monitoring'
import { logger } from './utils/logger'

// Initialize stability and monitoring features
initializeStability()
initializeMonitoring()

// Log application startup
logger.info('React app starting', 'MAIN', {
  version: typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '0.0.0',
  buildTime: typeof __BUILD_TIME__ !== 'undefined' ? __BUILD_TIME__ : 'unknown',
  environment: import.meta.env.DEV ? 'development' : 'production',
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
