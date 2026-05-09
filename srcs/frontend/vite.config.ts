import { defineConfig } from 'vite';
import path from 'path';
import fs from 'fs';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';

// Helper function to safely read certificate files
function getCertificate(certPath: string | undefined, keyPath: string | undefined) {
  if (!certPath || !keyPath) {
    console.log('HTTPS certificate paths not provided, falling back to HTTP');
    return false;
  }

  try {
    const cert = fs.readFileSync(path.resolve(certPath));
    const key = fs.readFileSync(path.resolve(keyPath));
    return { cert, key };
  } catch (error) {
    console.error('Failed to read certificate files:', error);
    return false;
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  assetsInclude: ['**/*.svg', '**/*.csv'],
  server: {
    host: true,
    port: 5173,
    watch: { usePolling: true },
    https: getCertificate(
      process.env.INT_CRT_NAME ? `/certs/${process.env.INT_CRT_NAME}` : undefined,
      process.env.INT_KEY_NAME ? `/certs/${process.env.INT_KEY_NAME}` : undefined
    ),
    // Proxy configuration with proper TLS validation
    proxy: {
      '/api': {
        target: process.env.BACKEND_URL || 'https://gateway',
        changeOrigin: true,
        secure: false,                     // enable SSL verification
      },
    },
  },
});