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
      // CONFIGURACIÓN CORREGIDA: Captura todo lo que vaya a tu backend
      '/api': {
        target: 'http://localhost:8086', // Asegúrate de usar el puerto real de tu backend (en tu error salía 8086)
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''), // Quita el '/api' antes de enviarlo a PHP
      },
    },
  },
})