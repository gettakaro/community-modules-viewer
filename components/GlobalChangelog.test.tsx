import React from 'react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import GlobalChangelog from './GlobalChangelog';
import type { ChangelogEntry } from '@/lib/types';

const push = vi.fn();

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
  beforeEach(() => {
    push.mockClear();
    vi.mocked(useRouter).mockReturnValue({
      push,
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
    });
  });

  it('makes the full changelog card navigate to the module detail page', () => {
    render(<GlobalChangelog changes={changes} />);

    fireEvent.click(
      screen.getByRole('link', { name: 'View Ranking_Sezonowy module' }),
    );

    expect(push).toHaveBeenCalledWith('/module/Ranking_Sezonowy/latest');
  });

  it('keeps the module title as a direct link', () => {
    render(<GlobalChangelog changes={changes} />);

    expect(
      screen.getByRole('link', { name: 'Ranking_Sezonowy' }),
    ).toHaveAttribute('href', '/module/Ranking_Sezonowy/latest');
  });
});
