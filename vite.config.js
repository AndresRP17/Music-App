import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // El proxy que ya tenías para Deezer
      '/deezer': {
        target: 'https://api.deezer.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/deezer/, ''),
      },
      // NUEVO: El proxy para TU backend de PHP
      '/favorites': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''), // Le quita el '/api' antes de mandarlo a PHP
      },
    },
  },
})