import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Atlas } from '../components/Atlas';
import { Journal } from '../components/Journal';
import { createInitialStoryState } from '../data/storyGraph';
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
  it('does not label a fresh in-progress run as dark', () => {
    render(<Atlas open storyState={createInitialStoryState()} onClose={() => undefined} reduced />);

    const trajectory = screen.getByLabelText('Ending trajectory');
    expect(within(trajectory).getByText('Path still forming')).toBeVisible();
    expect(within(trajectory).queryByText('Dark Ending')).not.toBeInTheDocument();
  });

  it('shows the choice flowchart for each ending route', () => {
    render(<Atlas open storyState={createInitialStoryState()} onClose={() => undefined} reduced />);

    const flowchart = screen.getByLabelText('Choice flowchart');
    expect(within(flowchart).getAllByText('Start')).toHaveLength(3);
    expect(within(flowchart).getAllByText('Hopeful Ending').length).toBeGreaterThan(0);
    expect(within(flowchart).getByText('Broadcast every piece of proof')).toBeVisible();
    expect(within(flowchart).getByText('Leak the papers anonymously')).toBeVisible();
    expect(within(flowchart).getByText('Use the hatch alone')).toBeVisible();
  });

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

    const trajectory = screen.getByLabelText('Ending trajectory');
    expect(within(trajectory).getByRole('heading', { name: 'Ending trajectory' })).toBeVisible();
    expect(within(trajectory).getByText('Bittersweet Ending')).toBeVisible();
    expect(within(trajectory).getByText(/truth is moving faster than Mira can organise/i)).toBeVisible();
  });
});
