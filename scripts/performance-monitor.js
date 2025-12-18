#!/usr/bin/env node

/**
 * Performance Monitor Script
 * Tracks build performance and development server metrics
 */

import { performance } from 'perf_hooks'
import fs from 'fs'
import path from 'path'

class PerformanceMonitor {
  constructor() {
    this.metrics = {
      buildStart: null,
      buildEnd: null,
      devServerStart: null,
      hmrTime: null,
      bundleSizes: {},
      errors: []
    }
  }

  startBuild() {
    this.metrics.buildStart = performance.now()
    console.log('🚀 Starting build performance monitoring...')
  }

  endBuild() {
    this.metrics.buildEnd = performance.now()
    const duration = this.metrics.buildEnd - this.metrics.buildStart
    console.log(`✅ Build completed in ${(duration / 1000).toFixed(2)}s`)
    return duration
  }

  recordBundleSize(name, size) {
    this.metrics.bundleSizes[name] = size
  }

  startDevServer() {
    this.metrics.devServerStart = performance.now()
    console.log('🖥️  Development server starting with speed optimizations...')
  }

  recordHMR(time) {
    this.metrics.hmrTime = time
    console.log(`⚡ Hot Module Replacement: ${time.toFixed(2)}ms`)
  }

  recordError(error) {
    this.metrics.errors.push({
      message: error.message,
      timestamp: new Date().toISOString()
    })
  }

  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      buildDuration: this.metrics.buildEnd - this.metrics.buildStart,
      devServerStartup: this.metrics.devServerStart ? 
        performance.now() - this.metrics.devServerStart : null,
      hmrTime: this.metrics.hmrTime,
      bundleSizes: this.metrics.bundleSizes,
      errors: this.metrics.errors,
      optimizations: [
        'esnext target for faster builds',
        'Manual chunk splitting for better caching',
        'File system strict mode disabled',
        'Watch patterns optimized',
        'Dependency exclusions configured',
        'Host configuration enabled',
        'HMR overlay disabled for speed'
      ]
    }

    // Save report
    const reportPath = path.join(process.cwd(), 'performance-report.json')
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
    
    console.log('\n📊 Performance Report Generated:')
    console.log(`   Build Time: ${(report.buildDuration / 1000).toFixed(2)}s`)
    console.log(`   HMR Time: ${report.hmrTime ? report.hmrTime.toFixed(2) + 'ms' : 'N/A'}`)
    console.log(`   Total Bundle Size: ${Object.values(report.bundleSizes).reduce((a, b) => a + b, 0) / 1024 / 1024:.2f}MB`)
    console.log(`   Report saved to: ${reportPath}`)
    
    return report
  }
}

// Export for use in other scripts
export default PerformanceMonitor

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const monitor = new PerformanceMonitor()
  monitor.startBuild()
  
  // Simulate build process
  setTimeout(() => {
    const duration = monitor.endBuild()
    monitor.recordBundleSize('vendor', 142.23 * 1024) // KB
    monitor.recordBundleSize('router', 33.04 * 1024)  // KB
    monitor.recordBundleSize('supabase', 184.94 * 1024) // KB
    monitor.recordBundleSize('main', 239.73 * 1024)  // KB
    
    monitor.startDevServer()
    monitor.recordHMR(150) // Simulated HMR time
    
    monitor.generateReport()
  }, 2000)
}