import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: false, // Allow fallback to other ports if 5173 is busy
    open: true,
    hmr: {
      overlay: true
    },
    watch: {
      usePolling: true // Better file watching on Windows
    }
  },
  preview: {
    port: 4173,
    host: '0.0.0.0'
  }
})
