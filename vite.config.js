import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// "base" debe coincidir con el nombre del repositorio para que
// la app funcione en https://pelozok.github.io/jc-finanzas/
export default defineConfig({
  plugins: [react()],
  base: '/jc-finanzas/',
})
