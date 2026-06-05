import { expect, test } from '@playwright/test';

test('map hotspots reveal lore', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('img', { name: /underwater city of athel/i })).toBeVisible();
  await expect(page.getByText('Select a brass pin on the map.')).toBeVisible();

  await page.getByRole('button', { name: 'Open lore for Engine Room' }).click();
  await expect(page.getByRole('heading', { name: 'Engine Room', exact: true })).toBeVisible();
  await expect(page.getByText(/confidential report/i)).toBeVisible();

  await page.getByRole('button', { name: 'Open lore for The Glass Dome' }).click();
  await expect(page.getByRole('heading', { name: 'The Glass Dome', exact: true })).toBeVisible();
  await expect(page.getByText(/forbidden surface/i)).toBeVisible();
});
