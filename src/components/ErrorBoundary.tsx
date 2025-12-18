/**
 * Error Boundary Component for React
 * Catches JavaScript errors in component tree and displays fallback UI
 */

import React from 'react'
import { logger } from '../utils/logger'
import { getErrorMessage } from '../utils/errorHandler'

interface Props {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>
  context?: string
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

export class ErrorBoundary extends React.Component<Props, State> {
  private retryCount = 0
  private maxRetries = 3

  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorInfo: null,
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log the error with context
    logger.trackError(error, this.props.context || 'ErrorBoundary', {
      componentStack: errorInfo.componentStack,
      retryCount: this.retryCount,
    })

    this.setState({
      error,
      errorInfo,
    })
  }

  handleRetry = () => {
    if (this.retryCount < this.maxRetries) {
      this.retryCount++
      logger.info(`Retrying after error (attempt ${this.retryCount}/${this.maxRetries})`, 'ErrorBoundary')
      
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
      })
    } else {
      logger.error('Max retry attempts reached for error boundary', 'ErrorBoundary')
    }
  }

  render() {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return <FallbackComponent error={this.state.error} retry={this.handleRetry} />
      }

      // Default fallback UI
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
                    <p className="text-red-600 font-semibold">{this.state.error.name}</p>
                    <p className="text-gray-800">{this.state.error.message}</p>
                    {this.state.error.stack && (
                      <pre className="mt-2 text-xs text-gray-600 whitespace-pre-wrap">
                        {this.state.error.stack}
                      </pre>
                    )}
                  </div>
                </details>
              )}
              
              <div className="mt-6 flex flex-col space-y-3">
                {this.retryCount < this.maxRetries && (
                  <button
                    onClick={this.handleRetry}
                    className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    إعادة المحاولة ({this.retryCount}/{this.maxRetries})
                  </button>
                )}
                
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

    return this.props.children
  }
}

// Simple error boundary for smaller components
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  context?: string
) {
  return function WrappedComponent(props: P) {
    return (
      <ErrorBoundary context={context}>
        <Component {...props} />
      </ErrorBoundary>
    )
  }
}

// Hook for error handling in functional components
export function useErrorHandler() {
  return (error: Error, context?: string) => {
    logger.trackError(error, context)
    // You could also trigger a global error state here
  }
}