import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // Base relativa: permite publicar en https://usuario.github.io/<repo>/
  // sin depender del nombre del repositorio. La app no usa rutas internas.
  base: './',
  plugins: [react()],
});
