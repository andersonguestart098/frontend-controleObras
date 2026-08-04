import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': new URL('./src', import.meta.url).pathname,
      'lottie-react': 'lottie-react/build/index.es.js',
    },
  },
  server: {
    port: 5173,
    host: true,
  },
});
