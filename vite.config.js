import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Tu proxy original para las canciones de Deezer
      '/deezer': {
        target: 'https://api.deezer.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/deezer/, ''),
      },
      // El proxy para tu backend de CodeIgniter 4
      '/api': {
        target: 'http://localhost:8086', // 👈 Cambiado a 8080 para que coincida con tus errores de hoy
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''), 
      },
    },
  },
})