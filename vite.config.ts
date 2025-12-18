import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 6345,
    strictPort: true,
    host: true,
    cors: true,
    // Improve stability for development
    hmr: {
      overlay: false, // Disable error overlay for better user experience
    },
  },
  preview: {
    port: 6345,
    strictPort: true,
    host: true,
  },
  build: {
    // Optimize for production stability
    target: 'es2015',
    minify: 'esbuild',
    sourcemap: false, // Disable sourcemaps in production for security
    rollupOptions: {
      output: {
        // Ensure consistent chunk naming for caching
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    // Increase chunk size warning limit for better debugging
    chunkSizeWarningLimit: 1000,
  },
  // Environment variable validation
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '0.0.0'),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', '@supabase/supabase-js'],
  },
})
