


import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env vars regardless of the `VITE_` prefix.
  // FIX: Cast process to any to resolve 'Property cwd does not exist on type Process' error in TypeScript.
  const env = loadEnv(mode, (process as any).cwd(), '');
  
  return {
    plugins: [react()],
    define: {
      // Inject variables into process.env for client-side access
      // Note: process.env.API_KEY is injected automatically by the environment.
      'process.env.VITE_GOOGLE_MAPS_API_KEY': JSON.stringify(env.VITE_GOOGLE_MAPS_API_KEY),
    },
    server: {
      port: 3000,
      host: true,
    },
    build: {
      outDir: 'dist',
      target: 'esnext',
    },
  };
});
