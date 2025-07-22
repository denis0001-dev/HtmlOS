import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  root: '.',
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    minify: 'esbuild', // Minify JS and CSS (default)
    cssCodeSplit: true, // Ensure CSS is split and minified
  },
  server: {
    open: true,
  },
}); 