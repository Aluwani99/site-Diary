import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// Dev server proxies /api requests to the Express backend on port 3001,
// so the frontend can just call fetch('/api/...') with no CORS hassle.
export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
});
