// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    root: '.',        // where your index.html lives
    build: {
        outDir: 'dist'
    }
})
