
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  define: {
    // This allows process.env.GEMINI_API_KEY to be accessed in the client code
    // while Vite is bundling.
    'process.env.GEMINI_API_KEY': JSON.stringify(process.env.GEMINI_API_KEY),
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
