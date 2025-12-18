/**
 * Stability Utilities
 * Provides additional stability enhancements and monitoring
 */

// Global error handler for unhandled promise rejections
export function setupGlobalErrorHandlers() {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason)
    
    // Log to our logging system
    import('./logger').then(({ logger }) => {
      logger.error('Unhandled promise rejection', 'GLOBAL_ERROR', {
        reason: event.reason,
        stack: event.reason?.stack,
      })
    })
    
    // Prevent the default browser behavior
    event.preventDefault()
  })

  // Handle global JavaScript errors
  window.addEventListener('error', (event) => {
    console.error('Global error:', event.error)
    
    // Log to our logging system
    import('./logger').then(({ logger }) => {
      logger.error('Global JavaScript error', 'GLOBAL_ERROR', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error,
      })
    })
  })
}

// Performance monitoring
export function setupPerformanceMonitoring() {
  // Monitor Core Web Vitals
  if ('PerformanceObserver' in window) {
    // Largest Contentful Paint
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1] as any
      
      import('./logger').then(({ logger }) => {
        logger.info('LCP measured', 'PERFORMANCE', {
          value: lastEntry.startTime,
          element: lastEntry.element?.tagName,
        })
      })
    })
    
    try {
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })
    } catch (e) {
      // Fallback for browsers that don't support LCP
    }

    // First Input Delay
    const fidObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const fidEntry = entry as FIDPerformanceEntry
        import('./logger').then(({ logger }) => {
          logger.info('FID measured', 'PERFORMANCE', {
            value: fidEntry.processingStart - fidEntry.startTime,
            eventType: fidEntry.name,
          })
        })
      }
    })
    
    try {
      fidObserver.observe({ entryTypes: ['first-input'] })
    } catch (e) {
      // Fallback for browsers that don't support FID
    }

    // Cumulative Layout Shift
    const clsObserver = new PerformanceObserver((list) => {
      let clsValue = 0
      for (const entry of list.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value
        }
      }
      
      import('./logger').then(({ logger }) => {
        logger.info('CLS measured', 'PERFORMANCE', {
          value: clsValue,
        })
      })
    })
    
    try {
      clsObserver.observe({ entryTypes: ['layout-shift'] })
    } catch (e) {
      // Fallback for browsers that don't support CLS
    }
  }
}

// Memory usage monitoring
export function getMemoryUsage(): MemoryInfo | null {
  if ('memory' in performance && (performance as any).memory) {
    return (performance as any).memory as MemoryInfo
  }
  return null
}

// Network status monitoring
export function setupNetworkMonitoring() {
  const updateOnlineStatus = () => {
    const status = navigator.onLine ? 'online' : 'offline'
    
    import('./logger').then(({ logger }) => {
      logger.info(`Network status changed: ${status}`, 'NETWORK')
    })
    
    // Dispatch custom event for components to listen to
    window.dispatchEvent(new CustomEvent('networkstatuschange', {
      detail: { status }
    }))
  }

  window.addEventListener('online', updateOnlineStatus)
  window.addEventListener('offline', updateOnlineStatus)
}

// Storage quota monitoring
export async function getStorageQuota(): Promise<StorageEstimate | null> {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    try {
      return await navigator.storage.estimate()
    } catch (error) {
      console.warn('Storage quota check failed:', error)
      return null
    }
  }
  return null
}

// Resource loading monitoring
export function setupResourceMonitoring() {
  // Monitor resource loading times
  window.addEventListener('load', () => {
    setTimeout(() => {
      const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      
      import('./logger').then(({ logger }) => {
        logger.info('Page load metrics', 'PERFORMANCE', {
          domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
          loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
          firstByte: perfData.responseStart - perfData.requestStart,
          domInteractive: perfData.domInteractive - (perfData as any).navigationStart,
        })
      })
    }, 0)
  })
}

// Connection quality monitoring
export function getConnectionQuality(): {
  effectiveType?: string
  downlink?: number
  rtt?: number
  saveData?: boolean
} {
  if ('connection' in navigator) {
    const connection = (navigator as any).connection
    return {
      effectiveType: connection.effectiveType,
      downlink: connection.downlink,
      rtt: connection.rtt,
      saveData: connection.saveData,
    }
  }
  return {}
}

// Auto-recovery mechanisms
export class AutoRecovery {
  private static instance: AutoRecovery
  private recoveryAttempts = new Map<string, number>()
  private maxAttempts = 3
  private cooldownPeriod = 30000 // 30 seconds

  static getInstance(): AutoRecovery {
    if (!AutoRecovery.instance) {
      AutoRecovery.instance = new AutoRecovery()
    }
    return AutoRecovery.instance
  }

  async attemptRecovery(operation: () => Promise<any>, context: string): Promise<any> {
    const attempts = this.recoveryAttempts.get(context) || 0
    
    if (attempts >= this.maxAttempts) {
      throw new Error(`Max recovery attempts reached for ${context}`)
    }

    try {
      const result = await operation()
      
      // Reset attempts on success
      this.recoveryAttempts.delete(context)
      return result
    } catch (error) {
      const newAttempts = attempts + 1
      this.recoveryAttempts.set(context, newAttempts)
      
      import('./logger').then(({ logger }) => {
        logger.warn(`Recovery attempt ${newAttempts}/${this.maxAttempts} for ${context}`, 'AUTO_RECOVERY', {
          error: error instanceof Error ? error.message : error,
        })
      })
      
      // Wait before retrying
      if (newAttempts < this.maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, this.cooldownPeriod))
        return this.attemptRecovery(operation, context)
      }
      
      throw error
    }
  }
}

// Initialize all stability features
export function initializeStability() {
  setupGlobalErrorHandlers()
  setupPerformanceMonitoring()
  setupNetworkMonitoring()
  setupResourceMonitoring()
  
  import('./logger').then(({ logger }) => {
    logger.info('Stability features initialized', 'STABILITY')
  })
}