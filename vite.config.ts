import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
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
    // Speed optimizations for build
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: false,
    cssCodeSplit: true,
    // Faster rollup configuration
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          supabase: ['@supabase/supabase-js'],
        },
      },
    },
    chunkSizeWarningLimit: 2000,
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
  },
})
