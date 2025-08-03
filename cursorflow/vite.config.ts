import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Ensure server starts correctly
    host: 'localhost', // Changed from 0.0.0.0 to localhost for better Windows compatibility
    port: 5173,
    strictPort: false, // Allow fallback to other ports if 5173 is busy
    open: true,
    // Optimize dev server performance
    hmr: {
      overlay: false,
      port: 5173, // Explicit HMR port
    },
    watch: {
      usePolling: false, // Disabled polling for better performance on Windows
      interval: 1000,
    },
    // Add middleware for better error handling
    middlewareMode: false,
    // Enable better error reporting
    cors: true,
    // Add headers for better caching
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    }
  },
  preview: {
    port: 4173,
    host: 'localhost' // Changed from 0.0.0.0 to localhost
  },
  build: {
    // Optimize build performance
    target: 'esnext',
    minify: 'esbuild',
    rollupOptions: {
      output: {
        // Better code splitting
        manualChunks: {
          vendor: ['react', 'react-dom'],
          animations: ['framer-motion'],
          icons: ['lucide-react'],
        },
        // Optimize chunk naming
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },
    // Enable source maps for development
    sourcemap: false,
    // Optimize chunk size warnings
    chunkSizeWarningLimit: 1000,
  },
  optimizeDeps: {
    // Pre-bundle dependencies for faster dev server
    include: ['react', 'react-dom', 'framer-motion', 'lucide-react'],
  },
  // Enable experimental features for better performance
  experimental: {
    renderBuiltUrl(filename: string, { hostType }: { hostType: 'js' | 'css' | 'html' }) {
      if (hostType === 'js') {
        return { js: `/${filename}` }
      } else {
        return { relative: true }
      }
    },
  },
})
