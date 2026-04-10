import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    host: '::',
    port: 5173,
    allowedHosts: ['.coder.brobots.org.ua'],
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
})
