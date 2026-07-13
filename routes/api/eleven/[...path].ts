import { defineHandler } from 'void';
import { env } from 'void/env';

const ELEVENLABS_API = 'https://api.elevenlabs.io';
const ALLOWED_PATHS = [/^v1\/text-to-speech\/[^/]+$/, /^v1\/sound-generation$/];

function isAllowedPath(path: string): boolean {
  return ALLOWED_PATHS.some((pattern) => pattern.test(path));
}

export const POST = defineHandler(async (c) => {
  const path = c.req.param('path');

  if (!path) {
    return c.json({ error: 'Missing ElevenLabs endpoint.' }, 400);
  }

  if (!isAllowedPath(path)) {
    return c.json({ error: 'Unsupported ElevenLabs endpoint.' }, 404);
  }

  const apiKey = [env.ELEVENLABS_API_KEY, env.VITE_ELEVENLABS_API_KEY].find(
    (value): value is string => typeof value === 'string' && value.length > 0
  );

  if (!apiKey) {
    return c.json({ error: 'ElevenLabs API key is not configured.' }, 503);
  }

  const upstream = await fetch(`${ELEVENLABS_API}/${path}${new URL(c.req.url).search}`, {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
      'content-type': c.req.header('content-type') ?? 'application/json',
      accept: c.req.header('accept') ?? 'audio/mpeg'
    },
    body: await c.req.text()
  });

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: {
      'content-type': upstream.headers.get('content-type') ?? 'audio/mpeg'
    }
  });
});
