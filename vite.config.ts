import react from '@vitejs/plugin-react';
import type { ProxyOptions } from 'vite';
import { loadEnv } from 'vite';
import { defineConfig } from 'vitest/config';

export default defineConfig(({ mode }) => {
  // Read every env var (including non-VITE names) so we can keep the secret key
  // server-side and accept either ELEVENLABS_API_KEY or VITE_ELEVENLABS_API_KEY.
  const env = loadEnv(mode, process.cwd(), '');
  const elevenKey = env.ELEVENLABS_API_KEY || env.VITE_ELEVENLABS_API_KEY || '';

  const elevenProxy: Record<string, ProxyOptions> | undefined = elevenKey
    ? {
        '/eleven': {
          target: 'https://api.elevenlabs.io',
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path.replace(/^\/eleven/, ''),
          // Inject the key server-side both statically and via the request hook
          // (covers different proxy implementations / request types).
          headers: { 'xi-api-key': elevenKey },
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              proxyReq.setHeader('xi-api-key', elevenKey);
            });
          }
        }
      }
    : undefined;

  return {
    plugins: [react()],
    // Expose only a boolean to the client — never the key itself.
    define: {
      __ELEVEN_VOICES__: JSON.stringify(Boolean(elevenKey))
    },
    server: { proxy: elevenProxy },
    preview: { proxy: elevenProxy },
    test: {
      environment: 'jsdom',
      globals: true,
      include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
      exclude: ['tests/e2e/**', 'node_modules/**', 'dist/**'],
      setupFiles: ['./src/test/setup.ts']
    }
  };
});
