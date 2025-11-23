/// <reference types="vitest" />

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
            return 'react-vendor';
          }

          if (id.includes('node_modules/react-router')) {
            return 'router-vendor';
          }

          if (id.includes('node_modules/@clerk/')) {
            return 'clerk-vendor';
          }

          if (id.includes('node_modules/@radix-ui/')) {
            return 'radix-vendor';
          }

          if (id.includes('node_modules/appwrite')) {
            return 'appwrite-vendor';
          }

          if (id.includes('node_modules/@google/genai')) {
            return 'genai-vendor';
          }

          if (
            id.includes('node_modules/date-fns') ||
            id.includes('node_modules/chrono-node') ||
            id.includes('node_modules/react-day-picker')
          ) {
            return 'date-vendor';
          }

          if (id.includes('node_modules/lucide-react')) {
            return 'icons-vendor';
          }

          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/core/test-setup/setup.ts',
  },
  define: {
    'import.meta.env.MODE': JSON.stringify('test'),
  },
  server: {
    port: 5174,
  },
});
