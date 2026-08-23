import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import GlobalChangelog from './GlobalChangelog';
import type { ChangelogEntry } from '@/lib/types';

const changes: ChangelogEntry[] = [
  {
    moduleName: 'Ranking_Sezonowy',
    category: 'events',
    date: '2026-07-29T00:00:00.000Z',
    title: 'New Module: Ranking_Sezonowy',
    description:
      'Updated to version latest. Added scheduled task: `updateLeaderboards`.',
    commitHash: 'abc1234',
    isNew: true,
  },
];

describe('GlobalChangelog', () => {
  it('renders each full changelog card as a real module link', () => {
    render(<GlobalChangelog changes={changes} />);

    expect(
      screen.getByRole('link', { name: 'View Ranking_Sezonowy module' }),
    ).toHaveAttribute('href', '/module/Ranking_Sezonowy/latest');
  });

  it('keeps the module title visible inside the linked card', () => {
    render(<GlobalChangelog changes={changes} />);

    expect(screen.getByText('Ranking_Sezonowy')).toBeInTheDocument();
  });
});
