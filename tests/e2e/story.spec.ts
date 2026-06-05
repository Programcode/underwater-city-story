import { expect, test } from '@playwright/test';
import { beginStory, choose, reachEnding } from './helpers';

test('reaches the hopeful ending through prepared, trusted choices', async ({ page }) => {
  await beginStory(page);

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
  await reachEnding(page, 'Hopeful Ending');

  await expect(page.getByText('The path you walked')).toBeVisible();
  await expect(page.getByText('Achievements earned')).toBeVisible();
  await expect(page.getByText('Into Open Sky')).toBeVisible();
});

test('reaches the bittersweet ending when the truth spreads without control', async ({ page }) => {
  await beginStory(page);

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
  await reachEnding(page, 'Bittersweet Ending');
});

test('reaches the dark ending through an isolated escape', async ({ page }) => {
  await beginStory(page);

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
  await reachEnding(page, 'Dark Ending');
});

test('restarting from an ending returns to the opening scene', async ({ page }) => {
  await beginStory(page);

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
  await reachEnding(page, 'Hopeful Ending');

  await page.getByRole('button', { name: 'Restart story' }).click();
  await choose(page, 'Grab the sandwich and run');
  await expect(page.getByText('The New Portrait', { exact: true })).toBeVisible();
});

test('optional choices collect artifacts and lore into the foldout atlas', async ({ page }) => {
  await beginStory(page);

  await choose(page, 'Ask Torin for the old administration notice');

  await page.getByRole('button', { name: 'Open the atlas' }).click();
  const atlas = page.getByRole('dialog', { name: 'The atlas of Athel' });
  await expect(atlas).toContainText('Tuna Sandwich');
  await expect(atlas).toContainText('Veyr Succession Notice');
  await page.getByRole('button', { name: 'Close the atlas' }).click();

  await choose(page, 'Study the new portrait');
  await expect(page.getByText('The Painted Eyes', { exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'Open the atlas' }).click();
  const reopened = page.getByRole('dialog', { name: 'The atlas of Athel' });
  await expect(reopened).toContainText('Glossy Portrait Detail');
  await expect(reopened).toContainText('The cast');
  await expect(reopened).toContainText('Achievements');
});

test('an in-progress run is saved and can be continued from the title', async ({ page }) => {
  await beginStory(page);

  await choose(page, 'Grab the sandwich and run');
  await expect(page.getByText('The New Portrait', { exact: true })).toBeVisible();

  // Reload: the autosaved run should offer Continue from the title.
  await page.reload();
  await expect(page.getByTestId('title-screen')).toBeVisible();
  const cont = page.getByRole('button', { name: 'Continue' });
  await expect(cont).toBeVisible();

  await cont.click();
  await expect(page.getByTestId('cinematic-map-stage')).toBeVisible();
  await expect(page.getByText('The New Portrait', { exact: true })).toBeVisible();
});
