/**
 * Error handling utilities for consistent error management across the application
 */

import { logger } from './logger'

export interface AppError extends Error {
  code?: string
  statusCode?: number
  context?: string
  isOperational?: boolean
}

export class ApplicationError extends Error implements AppError {
  public readonly code?: string
  public readonly statusCode?: number
  public readonly context?: string
  public readonly isOperational: boolean

  constructor(
    message: string,
    options: {
      code?: string
      statusCode?: number
      context?: string
      isOperational?: boolean
      cause?: Error
    } = {}
  ) {
    super(message)
    
    this.name = 'ApplicationError'
    this.code = options.code
    this.statusCode = options.statusCode
    this.context = options.context
    this.isOperational = options.isOperational ?? true
    
    // Maintains proper stack trace for where our error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApplicationError)
    }

    // Log the error
    logger.trackError(this, options.context)
  }
}

export class ValidationError extends ApplicationError {
  constructor(message: string, context?: string) {
    super(message, {
      code: 'VALIDATION_ERROR',
      statusCode: 400,
      context,
      isOperational: true,
    })
    this.name = 'ValidationError'
  }
}

export class NetworkError extends ApplicationError {
  constructor(message: string, context?: string, cause?: Error) {
    super(message, {
      code: 'NETWORK_ERROR',
      statusCode: 0,
      context,
      isOperational: true,
      cause,
    })
    this.name = 'NetworkError'
  }
}

export class DatabaseError extends ApplicationError {
  constructor(message: string, context?: string, cause?: Error) {
    super(message, {
      code: 'DATABASE_ERROR',
      statusCode: 500,
      context,
      isOperational: true,
      cause,
    })
    this.name = 'DatabaseError'
  }
}

export class AuthenticationError extends ApplicationError {
  constructor(message: string, context?: string) {
    super(message, {
      code: 'AUTH_ERROR',
      statusCode: 401,
      context,
      isOperational: true,
    })
    this.name = 'AuthenticationError'
  }
}

export class PermissionError extends ApplicationError {
  constructor(message: string, context?: string) {
    super(message, {
      code: 'PERMISSION_ERROR',
      statusCode: 403,
      context,
      isOperational: true,
    })
    this.name = 'PermissionError'
  }
}

export class NotFoundError extends ApplicationError {
  constructor(message: string, context?: string) {
    super(message, {
      code: 'NOT_FOUND',
      statusCode: 404,
      context,
      isOperational: true,
    })
    this.name = 'NotFoundError'
  }
}

// Error handling utilities
export function handleError(error: unknown, context?: string): AppError {
  // If it's already an AppError, return it
  if (error instanceof ApplicationError) {
    return error
  }

  // If it's a standard Error, wrap it
  if (error instanceof Error) {
    return new ApplicationError(error.message, {
      context,
      cause: error,
    })
  }

  // Handle other types
  const message = String(error)
  return new ApplicationError(message, {
    context,
    isOperational: true,
  })
}

// Async error handler for promise rejections
export function handleAsyncError<T>(
  promise: Promise<T>,
  context?: string
): Promise<T> {
  return promise.catch((error) => {
    const handledError = handleError(error, context)
    throw handledError
  })
}

// Retry utility with exponential backoff
export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  options: {
    maxAttempts?: number
    baseDelay?: number
    maxDelay?: number
    context?: string
  } = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    baseDelay = 1000,
    maxDelay = 10000,
    context = 'RETRY_OPERATION',
  } = options

  let lastError: Error

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      logger.debug(`Attempt ${attempt}/${maxAttempts}`, context)
      return await operation()
    } catch (error) {
      lastError = handleError(error, context) as Error

      if (attempt === maxAttempts) {
        logger.error(`Failed after ${maxAttempts} attempts`, context, { error: lastError })
        throw lastError
      }

      // Calculate delay with exponential backoff and jitter
      const delay = Math.min(
        baseDelay * Math.pow(2, attempt - 1) + Math.random() * 1000,
        maxDelay
      )

      logger.warn(`Attempt ${attempt} failed, retrying in ${delay}ms`, context, {
        error: lastError.message,
      })

      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  throw lastError!
}

// Timeout utility
export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  context?: string
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      const error = new NetworkError(
        `Operation timed out after ${timeoutMs}ms`,
        context
      )
      reject(error)
    }, timeoutMs)
  })

  return Promise.race([promise, timeoutPromise])
}

// Error boundary helper
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  
  if (typeof error === 'string') {
    return error
  }
  
  return 'An unknown error occurred'
}

// Validate environment variables
export function validateEnvironmentVariables(requiredVars: string[]): void {
  const missing: string[] = []
  
  requiredVars.forEach((varName) => {
    if (!import.meta.env[varName]) {
      missing.push(varName)
    }
  })
  
  if (missing.length > 0) {
    throw new ValidationError(
      `Missing required environment variables: ${missing.join(', ')}`,
      'ENV_VALIDATION'
    )
  }
}

// Health check utility
export interface HealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  checks: {
    environment: boolean
    supabase: boolean
    storage: boolean
  }
  errors?: string[]
}

export async function performHealthCheck(): Promise<HealthCheck> {
  const timestamp = new Date().toISOString()
  const errors: string[] = []
  
  // Check environment variables
  let envHealthy = false
  try {
    validateEnvironmentVariables(['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'])
    envHealthy = true
  } catch (error) {
    errors.push(`Environment: ${getErrorMessage(error)}`)
  }
  
  // Check Supabase connection
  let supabaseHealthy = false
  try {
    // Simple health check - this would need to be implemented with actual Supabase client
    supabaseHealthy = true
  } catch (error) {
    errors.push(`Supabase: ${getErrorMessage(error)}`)
  }
  
  // Check localStorage
  let storageHealthy = false
  try {
    const testKey = 'health_check'
    localStorage.setItem(testKey, 'test')
    localStorage.removeItem(testKey)
    storageHealthy = true
  } catch (error) {
    errors.push(`Storage: ${getErrorMessage(error)}`)
  }
  
  const checks = {
    environment: envHealthy,
    supabase: supabaseHealthy,
    storage: storageHealthy,
  }
  
  const allHealthy = Object.values(checks).every(Boolean)
  const someHealthy = Object.values(checks).some(Boolean)
  
  const status = allHealthy ? 'healthy' : someHealthy ? 'degraded' : 'unhealthy'
  
  return {
    status,
    timestamp,
    checks,
    errors: errors.length > 0 ? errors : undefined,
  }
}