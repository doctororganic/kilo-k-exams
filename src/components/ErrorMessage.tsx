/**
 * Error Message Components
 * Provides consistent error feedback across the application
 */

import React from 'react'
import { logger } from '../utils/logger'

interface ErrorMessageProps {
  message: string
  type?: 'error' | 'warning' | 'info'
  title?: string
  showDetails?: boolean
  onRetry?: () => void
  onDismiss?: () => void
  className?: string
}

const typeStyles = {
  error: {
    container: 'bg-red-50 border-red-200 text-red-800',
    icon: 'text-red-400',
    title: 'text-red-800',
    button: 'bg-red-100 text-red-800 hover:bg-red-200',
  },
  warning: {
    container: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    icon: 'text-yellow-400',
    title: 'text-yellow-800',
    button: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
  },
  info: {
    container: 'bg-blue-50 border-blue-200 text-blue-800',
    icon: 'text-blue-400',
    title: 'text-blue-800',
    button: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
  },
}

export function ErrorMessage({
  message,
  type = 'error',
  title,
  showDetails = false,
  onRetry,
  onDismiss,
  className = '',
}: ErrorMessageProps) {
  const styles = typeStyles[type]

  return (
    <div className={`rounded-md border p-4 ${styles.container} ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <svg
            className={`h-5 w-5 ${styles.icon}`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          {title && (
            <h3 className={`text-sm font-medium ${styles.title}`}>
              {title}
            </h3>
          )}
          <div className={`text-sm ${title ? 'mt-2' : ''}`}>
            {message}
          </div>
          {showDetails && (
            <div className="mt-2 text-xs opacity-75">
              {import.meta.env.DEV && (
                <details>
                  <summary className="cursor-pointer">تفاصيل تقنية</summary>
                  <pre className="mt-1 whitespace-pre-wrap">
                    {JSON.stringify({ message, type, timestamp: new Date().toISOString() }, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          )}
          {(onRetry || onDismiss) && (
            <div className="mt-4 flex space-x-3">
              {onRetry && (
                <button
                  onClick={onRetry}
                  className={`text-sm px-3 py-1 rounded ${styles.button}`}
                >
                  إعادة المحاولة
                </button>
              )}
              {onDismiss && (
                <button
                  onClick={onDismiss}
                  className="text-sm px-3 py-1 rounded bg-gray-100 text-gray-800 hover:bg-gray-200"
                >
                  تجاهل
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Network error component
interface NetworkErrorProps {
  onRetry?: () => void
  onDismiss?: () => void
  className?: string
}

export function NetworkError({ onRetry, onDismiss, className = '' }: NetworkErrorProps) {
  const handleRetry = () => {
    logger.info('User retrying after network error', 'ERROR_MESSAGE')
    onRetry?.()
  }

  return (
    <ErrorMessage
      type="error"
      title="خطأ في الاتصال"
      message="فشل في الاتصال بالخادم. يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى."
      onRetry={handleRetry}
      onDismiss={onDismiss}
      className={className}
    />
  )
}

// Database error component
interface DatabaseErrorProps {
  onRetry?: () => void
  onDismiss?: () => void
  className?: string
}

export function DatabaseError({ onRetry, onDismiss, className = '' }: DatabaseErrorProps) {
  const handleRetry = () => {
    logger.info('User retrying after database error', 'ERROR_MESSAGE')
    onRetry?.()
  }

  return (
    <ErrorMessage
      type="error"
      title="خطأ في قاعدة البيانات"
      message="حدث خطأ أثناء الوصول لقاعدة البيانات. يرجى المحاولة مرة أخرى."
      onRetry={handleRetry}
      onDismiss={onDismiss}
      className={className}
    />
  )
}

// Authentication error component
interface AuthErrorProps {
  onRetry?: () => void
  onDismiss?: () => void
  className?: string
}

export function AuthError({ onRetry, onDismiss, className = '' }: AuthErrorProps) {
  return (
    <ErrorMessage
      type="warning"
      title="خطأ في المصادقة"
      message="فشل في التحقق من هويتك. قد تحتاج إلى تسجيل الدخول مرة أخرى."
      onRetry={onRetry}
      onDismiss={onDismiss}
      className={className}
    />
  )
}

// Generic error boundary fallback
interface ErrorFallbackProps {
  error: Error
  retry: () => void
}

export function ErrorFallback({ error, retry }: ErrorFallbackProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
        <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
          <svg
            className="w-6 h-6 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        
        <div className="mt-4 text-center">
          <h3 className="text-lg font-medium text-gray-900">
            حدث خطأ غير متوقع
          </h3>
          <p className="mt-2 text-sm text-gray-600">
            عذراً، حدث خطأ في التطبيق. يرجى المحاولة مرة أخرى.
          </p>
          
          {import.meta.env.DEV && (
            <details className="mt-4 text-left">
              <summary className="cursor-pointer text-sm font-medium text-gray-700">
                تفاصيل الخطأ (وضع التطوير)
              </summary>
              <div className="mt-2 p-2 bg-gray-100 rounded text-xs font-mono">
                <p className="text-red-600 font-semibold">{error.name}</p>
                <p className="text-gray-800">{error.message}</p>
                {error.stack && (
                  <pre className="mt-2 text-xs text-gray-600 whitespace-pre-wrap">
                    {error.stack}
                  </pre>
                )}
              </div>
            </details>
          )}
          
          <div className="mt-6 flex flex-col space-y-3">
            <button
              onClick={retry}
              className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              إعادة المحاولة
            </button>
            
            <button
              onClick={() => window.location.reload()}
              className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              إعادة تحميل الصفحة
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}