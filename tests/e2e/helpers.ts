import { expect, type Locator, type Page } from '@playwright/test';

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Emulates reduced motion so the cinematic timing collapses for fast, stable runs. */
export async function prepare(page: Page): Promise<void> {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  // Keep e2e deterministic and offline even if a real ElevenLabs key is present:
  // disable voices + ambience before any app code runs.
  await page.addInitScript(() => {
    try {
      window.localStorage.setItem('athel-voice-enabled', 'false');
      window.localStorage.setItem('athel-ambience-enabled', 'false');
    } catch {
      /* ignore */
    }
  });
}

/** Starts the story from the title screen and waits for the cinematic stage. */
export async function beginStory(page: Page): Promise<void> {
  await prepare(page);
  await page.goto('/');
  await expect(page.getByTestId('title-screen')).toBeVisible();
  await page.getByRole('button', { name: 'Begin the Descent' }).click();
  await expect(page.getByTestId('cinematic-map-stage')).toBeVisible();
}

/**
 * Advances the line-by-line dialogue (by clicking the "Continue" affordance)
 * until the supplied target becomes visible. Works for both the choice layer
 * and the ending finale card.
 */
export async function revealBy(page: Page, target: Locator): Promise<void> {
  for (let attempt = 0; attempt < 45; attempt += 1) {
    if (await target.isVisible().catch(() => false)) {
      return;
    }
    const cont = page.getByRole('button', { name: 'Continue' }).first();
    if (await cont.isVisible().catch(() => false)) {
      await cont.click().catch(() => undefined);
    }
    await page.waitForTimeout(90);
  }
  await expect(target).toBeVisible();
}

/** Advances dialogue until the choices appear, then selects the labelled choice. */
export async function choose(page: Page, label: string): Promise<void> {
  const button = page.getByRole('button', { name: new RegExp('^' + escapeRegExp(label)) });
  await revealBy(page, button);
  await button.click();
}

/** Advances dialogue until an ending heading appears. */
export async function reachEnding(page: Page, title: string): Promise<void> {
  await revealBy(page, page.getByRole('heading', { name: title }));
  await expect(page.getByRole('heading', { name: title })).toBeVisible();
}
