import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/static/spa/',   // ✅ ΣΩΣΤΟ για SPA served από Django
})