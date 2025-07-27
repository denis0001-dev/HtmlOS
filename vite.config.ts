import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { createHtmlPlugin } from 'vite-plugin-html';

export default defineConfig({
    root: '.',
    base: './',
    plugins: [
        react(),
        createHtmlPlugin({
            minify: true, // Enable HTML minification
        }),
    ],
    build: {
        outDir: 'dist',
        emptyOutDir: true,
        minify: 'esbuild',
        cssCodeSplit: true,
    },
    server: {
        open: true,
    },
}); 