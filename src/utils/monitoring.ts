/**
 * Advanced Monitoring and Analytics System
 * Provides comprehensive application monitoring and performance tracking
 */

import { logger } from './logger'
import { performHealthCheck, type HealthCheck } from './errorHandler'

export interface PerformanceMetrics {
  timestamp: string
  pageLoadTime: number
  firstContentfulPaint: number
  largestContentfulPaint: number
  firstInputDelay: number
  cumulativeLayoutShift: number
  memoryUsage: {
    used: number
    total: number
    limit: number
  }
  networkRequests: number
  errors: number
}

export interface UserSession {
  sessionId: string
  userId?: string
  startTime: string
  endTime?: string
  pageViews: string[]
  interactions: UserInteraction[]
  errors: ErrorEvent[]
  performance: PerformanceMetrics[]
}

export interface UserInteraction {
  timestamp: string
  type: 'click' | 'scroll' | 'input' | 'navigation'
  element?: string
  page: string
  data?: any
}

export interface ErrorEvent {
  timestamp: string
  message: string
  stack?: string
  context: string
  userId?: string
  sessionId: string
}

// Performance monitoring class
export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: PerformanceMetrics[] = []
  private observers: PerformanceObserver[] = []

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  initialize(): void {
    this.setupWebVitals()
    this.setupResourceMonitoring()
    this.setupMemoryMonitoring()
    logger.info('Performance monitoring initialized', 'MONITORING')
  }

  private setupWebVitals(): void {
    // First Contentful Paint
    const fcpObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        logger.info('FCP measured', 'PERFORMANCE', {
          value: entry.startTime,
          element: (entry as any).element?.tagName,
        })
      }
    })

    // Largest Contentful Paint
    const lcpObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        logger.info('LCP measured', 'PERFORMANCE', {
          value: entry.startTime,
          element: (entry as any).element?.tagName,
        })
      }
    })

    // First Input Delay
    const fidObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        logger.info('FID measured', 'PERFORMANCE', {
          value: (entry as any).processingStart - entry.startTime,
        })
      }
    })

    // Cumulative Layout Shift
    const clsObserver = new PerformanceObserver((list) => {
      let clsValue = 0
      for (const entry of list.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value
        }
      }
      logger.info('CLS measured', 'PERFORMANCE', { value: clsValue })
    })

    try {
      fcpObserver.observe({ entryTypes: ['paint'] })
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })
      fidObserver.observe({ entryTypes: ['first-input'] })
      clsObserver.observe({ entryTypes: ['layout-shift'] })

      this.observers.push(fcpObserver, lcpObserver, fidObserver, clsObserver)
    } catch (error) {
      logger.warn('Failed to setup some performance observers', 'MONITORING', { error })
    }
  }

  private setupResourceMonitoring(): void {
    const resourceObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      logger.info('Resource timing collected', 'PERFORMANCE', {
        count: entries.length,
        resources: entries.map(entry => ({
          name: entry.name,
          duration: entry.duration,
          size: (entry as any).transferSize,
        }))
      })
    })

    try {
      resourceObserver.observe({ entryTypes: ['resource'] })
      this.observers.push(resourceObserver)
    } catch (error) {
      logger.warn('Failed to setup resource monitoring', 'MONITORING', { error })
    }
  }

  private setupMemoryMonitoring(): void {
    // Monitor memory usage periodically
    setInterval(() => {
      if ('memory' in performance) {
        const memory = (performance as any).memory
        logger.debug('Memory usage', 'PERFORMANCE', {
          used: memory.usedJSHeapSize,
          total: memory.totalJSHeapSize,
          limit: memory.jsHeapSizeLimit,
        })
      }
    }, 30000) // Every 30 seconds
  }

  getMetrics(): PerformanceMetrics[] {
    return [...this.metrics]
  }

  clearMetrics(): void {
    this.metrics = []
  }

  destroy(): void {
    this.observers.forEach(observer => observer.disconnect())
    this.observers = []
  }
}

// User behavior tracking
export class UserTracker {
  private static instance: UserTracker
  private currentSession: UserSession | null = null
  private interactions: UserInteraction[] = []
  private errors: ErrorEvent[] = []

  static getInstance(): UserTracker {
    if (!UserTracker.instance) {
      UserTracker.instance = new UserTracker()
    }
    return UserTracker.instance
  }

  startSession(userId?: string): void {
    this.currentSession = {
      sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      startTime: new Date().toISOString(),
      pageViews: [window.location.pathname],
      interactions: [],
      errors: [],
      performance: [],
    }

    logger.info('User session started', 'SESSION', { sessionId: this.currentSession.sessionId })
  }

  endSession(): void {
    if (this.currentSession) {
      this.currentSession.endTime = new Date().toISOString()
      this.currentSession.interactions = [...this.interactions]
      this.currentSession.errors = [...this.errors]

      logger.info('User session ended', 'SESSION', {
        sessionId: this.currentSession.sessionId,
        duration: new Date(this.currentSession.endTime).getTime() - new Date(this.currentSession.startTime).getTime(),
        interactions: this.interactions.length,
        errors: this.errors.length,
      })

      // Here you would typically send session data to analytics service
      this.sendAnalyticsData(this.currentSession)

      this.currentSession = null
      this.interactions = []
      this.errors = []
    }
  }

  trackInteraction(type: UserInteraction['type'], element?: string, data?: any): void {
    const interaction: UserInteraction = {
      timestamp: new Date().toISOString(),
      type,
      element,
      page: window.location.pathname,
      data,
    }

    this.interactions.push(interaction)

    // Keep only last 100 interactions to prevent memory issues
    if (this.interactions.length > 100) {
      this.interactions = this.interactions.slice(-100)
    }

    logger.debug('User interaction tracked', 'INTERACTION', interaction)
  }

  trackError(error: Error, context: string): void {
    const errorEvent: ErrorEvent = {
      timestamp: new Date().toISOString(),
      message: error.message,
      stack: error.stack,
      context,
      userId: this.currentSession?.userId,
      sessionId: this.currentSession?.sessionId || 'unknown',
    }

    this.errors.push(errorEvent)

    // Keep only last 50 errors
    if (this.errors.length > 50) {
      this.errors = this.errors.slice(-50)
    }

    logger.error('User error tracked', 'ERROR_TRACKING', errorEvent)
  }

  trackPageView(page: string): void {
    if (this.currentSession) {
      this.currentSession.pageViews.push(page)
      logger.info('Page view tracked', 'PAGE_VIEW', { page, sessionId: this.currentSession.sessionId })
    }
  }

  private sendAnalyticsData(session: UserSession): void {
    // This would integrate with your analytics service (Google Analytics, Mixpanel, etc.)
    try {
      // Example: Send to analytics endpoint
      const analyticsData = {
        session,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        screenSize: `${window.screen.width}x${window.screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      }

      // In production, send to your analytics service
      logger.info('Analytics data prepared', 'ANALYTICS', {
        sessionId: session.sessionId,
        interactions: session.interactions.length,
        errors: session.errors.length,
      })

      // Example fetch call (commented out)
      /*
      fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(analyticsData),
      }).catch(error => {
        logger.error('Failed to send analytics data', 'ANALYTICS', { error })
      })
      */

    } catch (error) {
      logger.error('Failed to prepare analytics data', 'ANALYTICS', { error })
    }
  }
}

// Health monitoring with alerts
export class HealthMonitor {
  private static instance: HealthMonitor
  private healthHistory: HealthCheck[] = []
  private alertThresholds = {
    responseTime: 3000, // 3 seconds
    errorRate: 0.05, // 5%
    memoryUsage: 0.8, // 80%
  }

  static getInstance(): HealthMonitor {
    if (!HealthMonitor.instance) {
      HealthMonitor.instance = new HealthMonitor()
    }
    return HealthMonitor.instance
  }

  async checkHealth(): Promise<HealthCheck> {
    const health = await performHealthCheck()
    this.healthHistory.push(health)

    // Keep only last 100 health checks
    if (this.healthHistory.length > 100) {
      this.healthHistory = this.healthHistory.slice(-100)
    }

    // Check for alerts
    this.checkAlerts(health)

    return health
  }

  private checkAlerts(health: HealthCheck): void {
    const alerts: string[] = []

    // Check error rate
    const recentErrors = this.healthHistory.slice(-10)
    const errorRate = recentErrors.filter(h => h.status === 'unhealthy').length / recentErrors.length

    if (errorRate > this.alertThresholds.errorRate) {
      alerts.push(`High error rate: ${(errorRate * 100).toFixed(1)}%`)
    }

    // Check memory usage
    if ('memory' in performance) {
      const memory = (performance as any).memory
      const memoryUsage = memory.usedJSHeapSize / memory.jsHeapSizeLimit

      if (memoryUsage > this.alertThresholds.memoryUsage) {
        alerts.push(`High memory usage: ${(memoryUsage * 100).toFixed(1)}%`)
      }
    }

    if (alerts.length > 0) {
      logger.warn('Health alerts detected', 'HEALTH_MONITOR', {
        alerts,
        health,
      })

      // Here you could send alerts to monitoring service
      this.sendAlerts(alerts, health)
    }
  }

  private sendAlerts(alerts: string[], health: HealthCheck): void {
    // Send alerts to monitoring service (email, Slack, etc.)
    logger.error('Sending health alerts', 'ALERTS', {
      alerts,
      health,
      timestamp: new Date().toISOString(),
    })

    // Example alert sending (commented out)
    /*
    fetch('/api/alerts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'health_alert',
        alerts,
        health,
        timestamp: new Date().toISOString(),
      }),
    }).catch(error => {
      logger.error('Failed to send health alerts', 'ALERTS', { error })
    })
    */
  }

  getHealthHistory(): HealthCheck[] {
    return [...this.healthHistory]
  }

  getAlertThresholds() {
    return { ...this.alertThresholds }
  }

  updateAlertThresholds(thresholds: Partial<typeof this.alertThresholds>): void {
    this.alertThresholds = { ...this.alertThresholds, ...thresholds }
    logger.info('Alert thresholds updated', 'HEALTH_MONITOR', { thresholds: this.alertThresholds })
  }
}

// Initialize monitoring on module load
export function initializeMonitoring(): void {
  const perfMonitor = PerformanceMonitor.getInstance()
  const userTracker = UserTracker.getInstance()
  const healthMonitor = HealthMonitor.getInstance()

  perfMonitor.initialize()
  userTracker.startSession()

  // Setup periodic health checks
  setInterval(() => {
    healthMonitor.checkHealth()
  }, 60000) // Every minute

  // Setup user interaction tracking
  document.addEventListener('click', (event) => {
    const target = event.target as HTMLElement
    userTracker.trackInteraction('click', target.tagName + (target.className ? '.' + target.className.split(' ')[0] : ''))
  })

  document.addEventListener('scroll', () => {
    userTracker.trackInteraction('scroll', undefined, {
      scrollY: window.scrollY,
      scrollHeight: document.documentElement.scrollHeight,
    })
  })

  // Track page visibility changes
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      userTracker.trackInteraction('navigation', 'page_hidden')
    } else {
      userTracker.trackInteraction('navigation', 'page_visible')
    }
  })

  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    userTracker.endSession()
    perfMonitor.destroy()
  })

  logger.info('Comprehensive monitoring system initialized', 'MONITORING')
}

// Export singleton instances
export const performanceMonitor = PerformanceMonitor.getInstance()
export const userTracker = UserTracker.getInstance()
export const healthMonitor = HealthMonitor.getInstance()