/**
 * Health Check Hook
 * Monitors application health and provides status updates
 */

import { useState, useEffect, useCallback } from 'react'
import { performHealthCheck, type HealthCheck } from '../utils/errorHandler'
import { logger } from '../utils/logger'

interface UseHealthCheckReturn {
  health: HealthCheck | null
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
  isHealthy: boolean
  lastCheck: Date | null
}

export function useHealthCheck(intervalMs: number = 30000): UseHealthCheckReturn {
  const [health, setHealth] = useState<HealthCheck | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastCheck, setLastCheck] = useState<Date | null>(null)

  const performCheck = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      logger.debug('Performing health check', 'HEALTH_CHECK')
      
      const healthCheck = await performHealthCheck()
      setHealth(healthCheck)
      setLastCheck(new Date())
      
      // Log health status changes
      if (healthCheck.status === 'unhealthy') {
        logger.error('Application health check failed', 'HEALTH_CHECK', healthCheck)
      } else if (healthCheck.status === 'degraded') {
        logger.warn('Application health check degraded', 'HEALTH_CHECK', healthCheck)
      } else {
        logger.debug('Application health check passed', 'HEALTH_CHECK')
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Health check failed'
      setError(errorMessage)
      logger.error('Health check error', 'HEALTH_CHECK', { error: err })
      
      // Set degraded status on error
      setHealth({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        checks: {
          environment: false,
          supabase: false,
          storage: false,
        },
        errors: [errorMessage],
      })
    } finally {
      setLoading(false)
    }
  }, [])

  const refresh = useCallback(async () => {
    await performCheck()
  }, [performCheck])

  // Initial check
  useEffect(() => {
    performCheck()
  }, [performCheck])

  // Set up periodic checks
  useEffect(() => {
    if (intervalMs > 0) {
      const interval = setInterval(performCheck, intervalMs)
      return () => clearInterval(interval)
    }
  }, [performCheck, intervalMs])

  const isHealthy = health?.status === 'healthy'

  return {
    health,
    loading,
    error,
    refresh,
    isHealthy,
    lastCheck,
  }
}

// Hook for monitoring specific services
export function useServiceHealth(service: 'supabase' | 'environment' | 'storage') {
  const health = useHealthCheck(0) // No automatic checks
  const [serviceStatus, setServiceStatus] = useState<'unknown' | 'healthy' | 'unhealthy'>('unknown')

  useEffect(() => {
    if (health.health) {
      const isServiceHealthy = health.health.checks[service]
      setServiceStatus(isServiceHealthy ? 'healthy' : 'unhealthy')
    }
  }, [health.health, service])

  return {
    ...health,
    isServiceHealthy: serviceStatus === 'healthy',
    serviceStatus,
  }
}

// Hook for connection status
export function useConnectionStatus() {
  const health = useHealthCheck(15000) // Check every 15 seconds

  return {
    isOnline: health.isHealthy,
    isOffline: !health.isHealthy && health.health !== null,
    isChecking: health.loading,
    lastCheck: health.lastCheck,
    health: health.health,
    error: health.error,
    refresh: health.refresh,
  }
}