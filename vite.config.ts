import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
import { voidPlugin } from 'void';

export default defineConfig(({ mode }) => {
  // Read every env var so the client gets only a boolean capability flag.
  // Runtime ElevenLabs calls go through a server route, which holds the key.
  // On Vercel the key is provided via the dashboard (process.env), while local
  // dev/Cloudflare builds read it from .env files via loadEnv.
  const env = loadEnv(mode, process.cwd(), '');
  const elevenKey =
    env.ELEVENLABS_API_KEY ||
    env.VITE_ELEVENLABS_API_KEY ||
    process.env.ELEVENLABS_API_KEY ||
    process.env.VITE_ELEVENLABS_API_KEY ||
    '';

  // Keep the Cloudflare/Void build available while producing a normal Vite SPA
  // for Vercel and other static hosts.
  const staticBuild = Boolean(process.env.VERCEL) || process.env.STATIC_BUILD === '1';

  return {
    plugins: [react(), ...(staticBuild ? [] : [voidPlugin()])],
    // Expose only a boolean to the client — never the key itself.
    define: {
      __ELEVEN_VOICES__: JSON.stringify(Boolean(elevenKey))
    },
    test: {
      environment: 'jsdom',
      globals: true,
      include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
      exclude: ['tests/e2e/**', 'node_modules/**', 'dist/**'],
      setupFiles: ['./src/test/setup.ts']
    }
  };
});
