// Ensures a minimal `.void/tsconfig.json` exists.
//
// This project is built on the Void framework, whose generated `.void/`
// directory is git-ignored and therefore absent on Vercel. The committed
// tsconfig files extend `.void/tsconfig.json`, which is read by both Vite
// (for the SPA build) and Vercel's function compiler (for api/). When that
// file is missing the build aborts with "Tsconfig not found".
//
// Void's server-side path aliases (void/db, @schema, ...) are not used by the
// static client or the Vercel Edge function, so an empty stub satisfies the
// `extends` chain. We only create it when absent, so a real `npx void prepare`
// is never clobbered. Run from Vercel's installCommand, before any build step.

import { existsSync, mkdirSync, writeFileSync } from 'node:fs';

const stubPath = '.void/tsconfig.json';

if (existsSync(stubPath)) {
  console.log(`[ensure-void-stub] ${stubPath} already exists — leaving as-is`);
} else {
  mkdirSync('.void', { recursive: true });
  writeFileSync(stubPath, `${JSON.stringify({ compilerOptions: {} }, null, 2)}\n`);
  console.log(`[ensure-void-stub] wrote stub ${stubPath}`);
}
