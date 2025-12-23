import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  server: {
    port: 6345,
    strictPort: true,
    host: true,
    cors: true,
    // Speed optimizations for development
    hmr: {
      overlay: false,
    },
    // Disable some checks for speed
    fs: {
      strict: false,
    },
    // Speed up hot module replacement
    watch: {
      ignored: ['**/node_modules/**', '**/.git/**'],
    },
  },
  preview: {
    port: 6345,
    strictPort: true,
    host: true,
  },
  build: {
    // Production optimizations for speed
    target: mode === 'production' ? 'es2015' : 'esnext',
    minify: mode === 'production' ? 'terser' : 'esbuild',
    sourcemap: false,
    cssCodeSplit: true,
    // Aggressive chunk splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunk for React ecosystem
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor'
            }
            if (id.includes('react-router')) {
              return 'router'
            }
            if (id.includes('@supabase')) {
              return 'supabase'
            }
            if (id.includes('framer-motion')) {
              return 'animation'
            }
            if (id.includes('lucide-react') || id.includes('@tabler/icons')) {
              return 'icons'
            }
            // Other large libraries
            return 'vendor'
          }
          // Application chunks
          if (id.includes('/src/pages/')) {
            return 'pages'
          }
          if (id.includes('/src/components/')) {
            return 'components'
          }
          if (id.includes('/src/utils/') || id.includes('/src/lib/')) {
            return 'utils'
          }
        },
        // Optimize chunk file names for caching
        chunkFileNames: mode === 'production' ? 'assets/[name]-[hash].js' : 'assets/[name].js',
        entryFileNames: mode === 'production' ? 'assets/[name]-[hash].js' : 'assets/[name].js',
        assetFileNames: mode === 'production' ? 'assets/[name]-[hash].[ext]' : 'assets/[name].[ext]',
      },
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
    // Enable CSS minification
    cssMinify: mode === 'production',
    // Report compressed size
    reportCompressedSize: false,
  },
  // Environment variable validation
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '0.0.0'),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
  // Optimize dependencies for speed
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@supabase/supabase-js',
      'framer-motion',
      'lucide-react'
    ],
    exclude: ['@vite/client', '@vite/env'],
  },
  // Development speed optimizations
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' },
    // Production minification options
    ...(mode === 'production' && {
      minify: true,
      treeShaking: true,
    }),
  },
  // Production-specific optimizations
  ...(mode === 'production' && {
    // Enable gzip compression
    compress: true,
    // Optimize CSS
    css: {
      devSourcemap: false,
      modules: {
        localsConvention: 'camelCaseOnly',
      },
    },
  }),
}))
