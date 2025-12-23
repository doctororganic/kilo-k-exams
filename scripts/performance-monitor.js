#!/usr/bin/env node

/**
 * Performance Monitoring Script
 * Monitors application performance and provides optimization recommendations
 */

const fs = require('fs');
const path = require('path');

class PerformanceMonitor {
  constructor() {
    this.reports = [];
    this.startTime = Date.now();
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const coloredMessage = this.colorize(message, type);
    console.log(`[${timestamp}] ${coloredMessage}`);
    this.reports.push({ timestamp, message, type });
  }

  colorize(message, type) {
    const colors = {
      success: '\x1b[32m',
      warning: '\x1b[33m',
      error: '\x1b[31m',
      info: '\x1b[36m',
      reset: '\x1b[0m'
    };
    return `${colors[type] || colors.info}${message}${colors.reset}`;
  }

  async checkBundleSize() {
    const distPath = path.join(process.cwd(), 'dist');
    if (!fs.existsSync(distPath)) {
      this.log('No dist folder found. Run build first.', 'warning');
      return;
    }

    const assets = fs.readdirSync(path.join(distPath, 'assets'));
    let totalSize = 0;
    const fileSizes = [];

    assets.forEach(file => {
      const filePath = path.join(distPath, 'assets', file);
      const stats = fs.statSync(filePath);
      const sizeKB = (stats.size / 1024).toFixed(2);
      totalSize += stats.size;
      fileSizes.push({ file, size: sizeKB });

      if (stats.size > 500 * 1024) { // 500KB
        this.log(`Large asset: ${file} (${sizeKB}KB)`, 'warning');
      }
    });

    const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(2);
    this.log(`Total bundle size: ${totalSizeMB}MB`, totalSizeMB > 5 ? 'warning' : 'success');
  }

  async checkDependencies() {
    try {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };

      // Check for heavy dependencies
      const heavyDeps = ['lodash', 'moment', 'jquery', 'bootstrap'];
      heavyDeps.forEach(dep => {
        if (deps[dep]) {
          this.log(`Heavy dependency found: ${dep} - consider alternatives`, 'warning');
        }
      });

      // Check for unused dependencies (basic check)
      const sourceFiles = this.getSourceFiles();
      Object.keys(deps).forEach(dep => {
        const usage = sourceFiles.some(file =>
          fs.readFileSync(file, 'utf8').includes(dep.replace('@', '').split('/')[0])
        );
        if (!usage && !['react', 'react-dom', 'vite', 'typescript'].includes(dep)) {
          this.log(`Potentially unused dependency: ${dep}`, 'info');
        }
      });

    } catch (error) {
      this.log(`Error checking dependencies: ${error.message}`, 'error');
    }
  }

  getSourceFiles() {
    const srcPath = path.join(process.cwd(), 'src');
    if (!fs.existsSync(srcPath)) return [];

    const files = [];
    function scan(dir) {
      fs.readdirSync(dir).forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
          scan(fullPath);
        } else if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.jsx') || file.endsWith('.js')) {
          files.push(fullPath);
        }
      });
    }
    scan(srcPath);
    return files;
  }

  async generateReport() {
    const duration = Date.now() - this.startTime;
    this.log(`Performance analysis completed in ${duration}ms`, 'success');

    // Generate recommendations
    this.log('\n=== PERFORMANCE RECOMMENDATIONS ===', 'info');
    this.log('1. Enable gzip compression on server', 'info');
    this.log('2. Implement proper caching headers', 'info');
    this.log('3. Use CDN for static assets', 'info');
    this.log('4. Optimize images and large assets', 'info');
    this.log('5. Implement code splitting for routes', 'info');
    this.log('6. Use lazy loading for components', 'info');
    this.log('7. Minimize render-blocking resources', 'info');
    this.log('8. Optimize font loading', 'info');

    // Save report
    const reportPath = path.join(process.cwd(), 'performance-report.json');
    fs.writeFileSync(reportPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      duration,
      reports: this.reports
    }, null, 2));

    this.log(`Report saved to: ${reportPath}`, 'success');
  }

  async run() {
    this.log('🚀 Starting Performance Analysis...', 'info');

    await this.checkBundleSize();
    await this.checkDependencies();
    await this.generateReport();
  }
}

// Run if called directly
if (require.main === module) {
  const monitor = new PerformanceMonitor();
  monitor.run().catch(console.error);
}

module.exports = PerformanceMonitor;