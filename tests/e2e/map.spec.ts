import { expect, test } from '@playwright/test';
import { beginStory, choose, prepare } from './helpers';

test('opens on a cinematic title and descends into a fullscreen map stage', async ({ page }) => {
  await prepare(page);
  await page.goto('/');

  const title = page.getByTestId('title-screen');
  await expect(title).toBeVisible();
  await expect(page.getByRole('heading', { name: /Athel/ })).toBeVisible();

  await page.getByRole('button', { name: 'Begin the Descent' }).click();

  await expect(page.getByTestId('cinematic-map-stage')).toBeVisible();
  await expect(page.getByRole('img', { name: /underwater city of athel/i })).toBeVisible();
  await expect(page.getByText("Torin's Shop", { exact: true })).toBeVisible();
  await expect(page.getByLabel('Narrator dialogue')).toBeVisible();
});

test('the atlas charts collected items and discovered places', async ({ page }) => {
  await beginStory(page);

  await page.getByRole('button', { name: 'Open the atlas' }).click();
  const atlas = page.getByRole('dialog', { name: 'The atlas of Athel' });
  await expect(atlas).toBeVisible();
  await expect(atlas).toContainText('Tuna Sandwich');
  await expect(atlas).toContainText('Market Levels');
  await page.getByRole('button', { name: 'Close the atlas' }).click();
  await expect(atlas).toBeHidden();

  // Descend to the engine room; reaching it should chart its lore.
  await choose(page, 'Grab the sandwich and run');
  await choose(page, 'Go to the engine room');
  await choose(page, 'Enter the marked room');
  await expect(page.getByText('Final Radiation Report C-137', { exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'Open the atlas' }).click();
  await expect(page.getByRole('dialog', { name: 'The atlas of Athel' })).toContainText('Engine Room');
});

test('the world map opens, shows place lore on click, and returns to the story', async ({ page }) => {
  await beginStory(page);

  await page.getByRole('button', { name: 'Open the world map' }).click();
  const worldMap = page.getByRole('dialog', { name: 'World map of Athel' });
  await expect(worldMap).toBeVisible();
  await expect(worldMap).toContainText('Tap any brass marker');

  await page.getByRole('button', { name: 'Show lore for Engine Room' }).click();
  await expect(worldMap.getByRole('heading', { name: 'Engine Room' })).toBeVisible();
  await expect(worldMap).toContainText('radiation readings at zero');

  await page.getByRole('button', { name: 'Show lore for The Glass Dome' }).click();
  await expect(worldMap.getByRole('heading', { name: 'The Glass Dome' })).toBeVisible();

  await page.getByRole('button', { name: 'Return to the story' }).click();
  await expect(worldMap).toBeHidden();
  await expect(page.getByTestId('cinematic-map-stage')).toBeVisible();
});

test('non-reduced scene changes show living-map travel before the next scene', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.addInitScript(() => {
    try {
      window.localStorage.setItem('athel-voice-enabled', 'false');
      window.localStorage.setItem('athel-ambience-enabled', 'false');
    } catch {
      /* ignore */
    }
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'Begin the Descent' }).click();
  await expect(page.getByTestId('cinematic-map-stage')).toBeVisible();

  await choose(page, 'Grab the sandwich and run');

  await expect(page.getByTestId('living-map-travel')).toBeVisible();
  await expect(page.locator('.actor--walk').first()).toBeVisible();
  await expect(page.getByText('The New Portrait', { exact: true })).toBeVisible({ timeout: 5000 });
});
