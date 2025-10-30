import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  root: '.',              // make sure it uses the root for index.html
  build: {
    outDir: 'dist',       // where Vercel expects the final files
    emptyOutDir: true
  }
})
