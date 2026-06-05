import { expect, test } from '@playwright/test';

async function choose(page: import('@playwright/test').Page, label: string) {
  await page.getByRole('button', { name: new RegExp(`^${label}`) }).click();
}

test('story choices can reach every ending', async ({ page }) => {
  await page.goto('/');

  await choose(page, 'Grab the sandwich and run');
  await choose(page, 'Go to the engine room');
  await choose(page, 'Enter the marked room');
  await choose(page, 'Try to forget the report');
  await choose(page, 'Watch for another blackout');
  await choose(page, 'Think of Torin');
  await choose(page, 'Listen at the door');
  await choose(page, 'Run to Torin');
  await choose(page, 'Return for reports and a recording');
  await choose(page, 'Broadcast every piece of proof');
  await expect(page.getByRole('heading', { name: 'Hopeful Ending' })).toBeVisible();

  await page.getByRole('button', { name: 'Restart story' }).click();
  await choose(page, 'Grab the sandwich and run');
  await choose(page, 'Go to the engine room');
  await choose(page, 'Enter the marked room');
  await choose(page, 'Try to forget the report');
  await choose(page, 'Watch for another blackout');
  await choose(page, 'Investigate alone');
  await choose(page, 'Listen at the door');
  await choose(page, 'Hide and record more');
  await choose(page, 'Leak the papers anonymously');
  await choose(page, 'Lead people toward the surface');
  await expect(page.getByRole('heading', { name: 'Bittersweet Ending' })).toBeVisible();

  await page.getByRole('button', { name: 'Restart story' }).click();
  await choose(page, 'Grab the sandwich and run');
  await choose(page, 'Go to the engine room');
  await choose(page, 'Enter the marked room');
  await choose(page, 'Try to forget the report');
  await choose(page, 'Watch for another blackout');
  await choose(page, 'Investigate alone');
  await choose(page, 'Listen at the door');
  await choose(page, 'Freeze as the door opens');
  await choose(page, 'Plan alone');
  await choose(page, 'Use the hatch alone');
  await expect(page.getByRole('heading', { name: 'Dark Ending' })).toBeVisible();
});

test('optional choices collect artifacts, info, and lore in the bottom journal', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('region', { name: 'Story journal' })).toContainText('Tuna Sandwich');

  await choose(page, 'Ask Torin for the old administration notice');
  await expect(page.getByRole('region', { name: 'Story journal' })).toContainText(
    'Veyr Succession Notice'
  );

  await choose(page, 'Study the new portrait');
  await expect(page.getByRole('heading', { name: 'The Painted Eyes' })).toBeVisible();
  await expect(page.getByRole('region', { name: 'Story journal' })).toContainText(
    'Glossy Portrait Detail'
  );

  await page.getByRole('button', { name: 'Open lore for Engine Room' }).click();
  await expect(page.getByRole('region', { name: 'Story journal' })).toContainText(
    'Engine Room Lore'
  );
});

test('story renders as an immersive map movie surface', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByTestId('cinematic-map-stage')).toBeVisible();
  await expect(page.getByLabel('Narrator dialogue')).toContainText("Torin's Shop");
  await expect(page.getByLabel('Character cameos')).toContainText('Mira');
  await expect(page.getByLabel('Character cameos')).toContainText('Torin');
  await expect(page.getByRole('region', { name: 'Map atlas journal' })).toBeVisible();

  await choose(page, 'Ask Torin for the old administration notice');
  await expect(page.getByLabel('Narrator dialogue')).toContainText('The New Portrait');
  await expect(page.getByText('Narrator')).toBeVisible();
});
