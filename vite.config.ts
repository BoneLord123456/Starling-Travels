
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // This allows process.env.API_KEY to be accessed in the client code
    // while Vite is bundling. Vercel will provide the API_KEY from its dashboard.
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY),
  },
  server: {
    port: 3000,
    host: true,
  },
  build: {
    outDir: 'dist',
    target: 'esnext',
  },
});
