import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
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
