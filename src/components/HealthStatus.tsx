/**
 * Health Status Component
 * Displays application health status and monitoring information
 */

import React from 'react'
import { useHealthCheck } from '../hooks/useHealthCheck'
import { LoadingSpinner } from './LoadingSpinner'

interface HealthStatusProps {
  showDetails?: boolean
  compact?: boolean
  autoRefresh?: boolean
  refreshInterval?: number
}

export function HealthStatus({
  showDetails = false,
  compact = false,
  autoRefresh = true,
  refreshInterval = 30000,
}: HealthStatusProps) {
  const { health, loading, error, refresh, isHealthy, lastCheck } = useHealthCheck(
    autoRefresh ? refreshInterval : 0
  )

  const getStatusColor = () => {
    if (!health) return 'gray'
    switch (health.status) {
      case 'healthy':
        return 'green'
      case 'degraded':
        return 'yellow'
      case 'unhealthy':
        return 'red'
      default:
        return 'gray'
    }
  }

  const getStatusText = () => {
    if (!health) return 'جاري التحقق...'
    switch (health.status) {
      case 'healthy':
        return 'جيد'
      case 'degraded':
        return 'متوسط'
      case 'unhealthy':
        return 'سيء'
      default:
        return 'غير معروف'
    }
  }

  const statusColor = getStatusColor()
  const colorClasses = {
    green: 'bg-green-100 text-green-800 border-green-200',
    yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    red: 'bg-red-100 text-red-800 border-red-200',
    gray: 'bg-gray-100 text-gray-800 border-gray-200',
  }

  if (compact) {
    return (
      <div className="flex items-center space-x-2">
        <div
          className={`w-2 h-2 rounded-full ${
            statusColor === 'green' ? 'bg-green-500' :
            statusColor === 'yellow' ? 'bg-yellow-500' :
            statusColor === 'red' ? 'bg-red-500' : 'bg-gray-500'
          }`}
        />
        <span className="text-sm text-gray-600">
          {getStatusText()}
        </span>
        {lastCheck && (
          <span className="text-xs text-gray-400">
            ({lastCheck.toLocaleTimeString()})
          </span>
        )}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">
          حالة النظام
        </h3>
        <div className="flex items-center space-x-2">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorClasses[statusColor]}`}
          >
            {getStatusText()}
          </span>
          <button
            onClick={refresh}
            disabled={loading}
            className="text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
          >
            {loading ? (
              <LoadingSpinner size="sm" />
            ) : (
              'تحديث'
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {health && (
        <div className="space-y-3">
          {/* Service Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="flex items-center space-x-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  health.checks.environment ? 'bg-green-500' : 'bg-red-500'
                }`}
              />
              <span className="text-sm text-gray-700">البيئة</span>
              <span className="text-xs text-gray-500">
                {health.checks.environment ? 'جيد' : 'سيء'}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  health.checks.supabase ? 'bg-green-500' : 'bg-red-500'
                }`}
              />
              <span className="text-sm text-gray-700">قاعدة البيانات</span>
              <span className="text-xs text-gray-500">
                {health.checks.supabase ? 'جيد' : 'سيء'}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  health.checks.storage ? 'bg-green-500' : 'bg-red-500'
                }`}
              />
              <span className="text-sm text-gray-700">التخزين</span>
              <span className="text-xs text-gray-500">
                {health.checks.storage ? 'جيد' : 'سيء'}
              </span>
            </div>
          </div>

          {/* Timestamp */}
          <div className="text-xs text-gray-500">
            آخر تحديث: {new Date(health.timestamp).toLocaleString()}
          </div>

          {/* Errors */}
          {health.errors && health.errors.length > 0 && showDetails && (
            <div className="mt-3">
              <h4 className="text-sm font-medium text-gray-700 mb-2">الأخطاء:</h4>
              <ul className="text-xs text-red-600 space-y-1">
                {health.errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Additional Details */}
          {showDetails && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <details className="text-xs">
                <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
                  تفاصيل تقنية
                </summary>
                <pre className="mt-2 p-2 bg-gray-50 rounded text-xs overflow-x-auto">
                  {JSON.stringify(health, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </div>
      )}

      {!health && !loading && !error && (
        <div className="text-center py-4 text-gray-500">
          لم يتم إجراء فحص صحة بعد
        </div>
      )}
    </div>
  )
}

// Connection status indicator for use in navigation or header
export function ConnectionStatus() {
  const { isOnline, isOffline, isChecking } = useHealthCheck(10000)

  if (isChecking) {
    return (
      <div className="flex items-center space-x-1">
        <LoadingSpinner size="sm" />
        <span className="text-xs text-gray-500">جاري التحقق...</span>
      </div>
    )
  }

  if (isOffline) {
    return (
      <div className="flex items-center space-x-1 text-red-600">
        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
        <span className="text-xs">غير متصل</span>
      </div>
    )
  }

  return (
    <div className="flex items-center space-x-1 text-green-600">
      <div className="w-2 h-2 bg-green-500 rounded-full" />
      <span className="text-xs">متصل</span>
    </div>
  )
}

// Health dashboard component for admin page
export function HealthDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          لوحة تحكم الصحة
        </h2>
        <p className="text-gray-600">
          مراقبة حالة النظام والخدمات المختلفة
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <HealthStatus showDetails={true} autoRefresh={true} />
        
        {/* Additional health monitoring components can be added here */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            معلومات النظام
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">إصدار التطبيق:</span>
              <span className="font-mono">{typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '0.0.0'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">وقت البناء:</span>
              <span className="font-mono">{typeof __BUILD_TIME__ !== 'undefined' ? __BUILD_TIME__ : 'غير متوفر'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">البيئة:</span>
              <span>{import.meta.env.DEV ? 'تطوير' : 'إنتاج'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">المتصفح:</span>
              <span>{navigator.userAgent.split(' ')[0]}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}