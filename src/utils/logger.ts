/**
 * Centralized logging system for the application
 * Provides structured logging with different levels and contexts
 */

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

export interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  context?: string
  data?: any
  userId?: string
  sessionId?: string
}

class Logger {
  private sessionId: string
  private isDevelopment: boolean

  constructor() {
    this.sessionId = this.generateSessionId()
    this.isDevelopment = import.meta.env.DEV
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    context?: string,
    data?: any
  ): LogEntry {
    const userId = this.getCurrentUserId()
    
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      data,
      userId,
      sessionId: this.sessionId,
    }

    // Log to console in development
    if (this.isDevelopment) {
      const consoleMethod = level === LogLevel.ERROR ? 'error' : 
                          level === LogLevel.WARN ? 'warn' : 
                          level === LogLevel.INFO ? 'info' : 'debug'
      
      console[consoleMethod](
        `[${entry.timestamp}] [${level.toUpperCase()}] [${context || 'APP'}] ${message}`,
        data || ''
      )
    }

    // Store in localStorage for debugging (development only)
    if (this.isDevelopment) {
      this.storeLogLocally(entry)
    }

    return entry
  }

  private getCurrentUserId(): string | undefined {
    try {
      const guestUserId = localStorage.getItem('guest_user_id')
      return guestUserId || undefined
    } catch {
      return undefined
    }
  }

  private storeLogLocally(entry: LogEntry): void {
    try {
      const logs = JSON.parse(localStorage.getItem('app_logs') || '[]')
      logs.push(entry)
      
      // Keep only last 100 logs to prevent storage bloat
      if (logs.length > 100) {
        logs.splice(0, logs.length - 100)
      }
      
      localStorage.setItem('app_logs', JSON.stringify(logs))
    } catch (error) {
      // Silently fail if localStorage is not available
    }
  }

  debug(message: string, context?: string, data?: any): void {
    this.createLogEntry(LogLevel.DEBUG, message, context, data)
  }

  info(message: string, context?: string, data?: any): void {
    this.createLogEntry(LogLevel.INFO, message, context, data)
  }

  warn(message: string, context?: string, data?: any): void {
    this.createLogEntry(LogLevel.WARN, message, context, data)
  }

  error(message: string, context?: string, data?: any): void {
    this.createLogEntry(LogLevel.ERROR, message, context, data)
  }

  // User action tracking
  trackUserAction(action: string, data?: any): void {
    this.info(`User action: ${action}`, 'USER_ACTION', data)
  }

  // API call tracking
  trackApiCall(endpoint: string, method: string, success: boolean, duration?: number, error?: any): void {
    const context = 'API_CALL'
    const message = `${method} ${endpoint} - ${success ? 'SUCCESS' : 'FAILED'}`
    const data = {
      endpoint,
      method,
      success,
      duration,
      error: error ? this.sanitizeError(error) : undefined,
    }
    
    if (success) {
      this.info(message, context, data)
    } else {
      this.error(message, context, data)
    }
  }

  // Page/component tracking
  trackPageView(page: string, data?: any): void {
    this.info(`Page view: ${page}`, 'PAGE_VIEW', data)
  }

  // Error tracking with context
  trackError(error: Error, context?: string, additionalData?: any): void {
    const errorData = {
      message: error.message,
      stack: error.stack,
      name: error.name,
      ...additionalData,
    }
    
    this.error(`Error in ${context || 'application'}`, 'ERROR', errorData)
  }

  // Get logs for debugging (development only)
  getStoredLogs(): LogEntry[] {
    if (!this.isDevelopment) return []
    
    try {
      return JSON.parse(localStorage.getItem('app_logs') || '[]')
    } catch {
      return []
    }
  }

  // Clear stored logs
  clearStoredLogs(): void {
    if (!this.isDevelopment) return
    
    localStorage.removeItem('app_logs')
  }

  // Sanitize error objects for logging
  private sanitizeError(error: any): any {
    if (error instanceof Error) {
      return {
        message: error.message,
        name: error.name,
        stack: error.stack,
      }
    }
    
    if (typeof error === 'object' && error !== null) {
      // Remove sensitive data
      const sanitized = { ...error }
      delete sanitized.password
      delete sanitized.token
      delete sanitized.secret
      return sanitized
    }
    
    return error
  }
}

// Export singleton instance
export const logger = new Logger()

// Convenience functions for different contexts
export const authLogger = {
  info: (message: string, data?: any) => logger.info(message, 'AUTH', data),
  error: (message: string, data?: any) => logger.error(message, 'AUTH', data),
  warn: (message: string, data?: any) => logger.warn(message, 'AUTH', data),
}

export const apiLogger = {
  info: (message: string, data?: any) => logger.info(message, 'API', data),
  error: (message: string, data?: any) => logger.error(message, 'API', data),
  warn: (message: string, data?: any) => logger.warn(message, 'API', data),
}

export const uiLogger = {
  info: (message: string, data?: any) => logger.info(message, 'UI', data),
  error: (message: string, data?: any) => logger.error(message, 'UI', data),
  warn: (message: string, data?: any) => logger.warn(message, 'UI', data),
}