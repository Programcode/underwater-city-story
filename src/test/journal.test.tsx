import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Atlas } from '../components/Atlas';
import { Journal } from '../components/Journal';
import type { StoryState } from '../types';

describe('Journal', () => {
  it('renders safely when restored state has no collected item list', () => {
    const restoredState = {
      currentSceneId: 'torins-shop',
      traits: { evidence: 0, trust: 0, risk: 0, collective: 0 },
      visitedSceneIds: ['torins-shop'],
      discoveredHotspotIds: ['market-levels'],
      selectedChoiceIds: [],
      endingId: null
    } as unknown as StoryState;

    render(<Journal state={restoredState} />);

    expect(screen.getByRole('heading', { name: 'Journal' })).toBeVisible();
    expect(screen.getAllByText('No entries yet.').length).toBeGreaterThan(0);
  });
});

describe('Atlas', () => {
  it('shows the in-progress ending trajectory', () => {
    const state = {
      currentSceneId: 'leak-and-collapse',
      traits: { evidence: 2, trust: 0, risk: 4, collective: 2 },
      visitedSceneIds: ['torins-shop', 'leak-and-collapse'],
      discoveredHotspotIds: ['market-levels', 'surface-dome'],
      collectedItemIds: [],
      selectedChoiceIds: ['anonymous-papers'],
      endingId: null
    } satisfies StoryState;

    render(<Atlas open storyState={state} onClose={() => undefined} reduced />);

    expect(screen.getByRole('heading', { name: 'Ending trajectory' })).toBeVisible();
    expect(screen.getByText('Bittersweet Ending')).toBeVisible();
    expect(screen.getByText(/truth is moving faster than Mira can organise/i)).toBeVisible();
  });
});
