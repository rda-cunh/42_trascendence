import { defineConfig } from 'vite';
import path from 'path';
import fs from 'fs';
import https from 'https';
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

// Helper to create an HTTPS agent for the proxy using the CA certificate
function getProxyAgent() {
  const caPath = '/certs/ca.crt';
  if (fs.existsSync(caPath)) {
    const ca = fs.readFileSync(caPath);
    console.log('✅ Using CA certificate for backend proxy validation');
    return new https.Agent({
      ca,
      rejectUnauthorized: true,   // validate backend certificate against the CA
    });
  }
  console.warn('⚠️ CA certificate not found, falling back to insecure proxy (secure: false)');
  return undefined;
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
        target: process.env.BACKEND_URL || 'https://localhost:8000',
        changeOrigin: true,
        secure: true,                     // enable SSL verification
        agent: getProxyAgent(),           // provide CA if available
        // If the backend uses a different hostname than 'localhost' in its certificate,
        // you may need to also set:
        // headers: { Host: 'backend-service-name' }
      },
    },
  },
});