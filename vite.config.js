import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],

  // Development server configuration
  server: {
    port: 5173,
    // Proxy API requests to avoid CORS in development
    proxy: {
      '/api': {
        target: 'http://localhost:9000',
        changeOrigin: true,
      },
    },
  },

  // Production build configuration
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
})
