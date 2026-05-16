import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
    // Serve index.html for all routes so React Router / pathname routing works
    historyApiFallback: true,
  },
  preview: {
    // Same for `vite preview`
    historyApiFallback: true,
  },
})