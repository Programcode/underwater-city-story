import react from '@vitejs/plugin-react';
import { loadEnv } from 'vite';
import { defineConfig } from 'vitest/config';
import { voidPlugin } from 'void';

export default defineConfig(({ mode }) => {
  // Read every env var so the client gets only a boolean capability flag.
  // Runtime ElevenLabs calls go through the Void API route, which holds the key.
  const env = loadEnv(mode, process.cwd(), '');
  const elevenKey = env.ELEVENLABS_API_KEY || env.VITE_ELEVENLABS_API_KEY || '';

  return {
    plugins: [voidPlugin(), react()],
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
