/// <reference types="vite/client" />

// Global variables defined by Vite
declare const __APP_VERSION__: string
declare const __BUILD_TIME__: string

// Performance types
interface PerformanceNavigationTiming extends PerformanceEntry {
  navigationStart: number
  loadEventStart: number
  loadEventEnd: number
  domContentLoadedEventStart: number
  domContentLoadedEventEnd: number
  domInteractive: number
  responseStart: number
  requestStart: number
}

// Memory types
interface MemoryInfo {
  usedJSHeapSize: number
  totalJSHeapSize: number
  jsHeapSizeLimit: number
}

// Performance entry types
interface FIDPerformanceEntry extends PerformanceEntry {
  processingStart: number
  name: string
}

interface LCPPerformanceEntry extends PerformanceEntry {
  startTime: number
  element?: Element
}

interface CLSPerformanceEntry extends PerformanceEntry {
  value: number
  hadRecentInput: boolean
}
