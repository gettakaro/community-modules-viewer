import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import GlobalChangelog from './GlobalChangelog';
import type { ChangelogEntry, ModuleWithMeta } from '@/lib/types';

const baseChange: ChangelogEntry = {
  moduleName: 'Ranking_Sezonowy',
  category: 'events',
  date: '2026-07-29T00:00:00.000Z',
  title: 'New Module: Ranking_Sezonowy',
  description:
    'Updated to version latest. Added scheduled task: `updateLeaderboards`.',
  commitHash: 'abc1234',
  isNew: true,
};

const moduleWithVersion = (name: string, tags: string[]): ModuleWithMeta =>
  ({
    name,
    category: 'events',
    source: 'community',
    takaroVersion: '0.0.0',
    versions: tags.map((tag) => ({
      tag,
      description: '',
      configSchema: '{}',
      uiSchema: '{}',
      commands: [],
      hooks: [],
      cronJobs: [],
      functions: [],
      permissions: [],
    })),
  }) as ModuleWithMeta;

describe('GlobalChangelog', () => {
  it('links changelog cards to the actual published latest tag', () => {
    render(
      <GlobalChangelog
        changes={[baseChange]}
        modules={[moduleWithVersion('Ranking_Sezonowy', ['latest'])]}
      />,
    );

    expect(
      screen.getByRole('link', { name: 'View Ranking_Sezonowy module' }),
    ).toHaveAttribute('href', '/module/Ranking_Sezonowy/latest');
  });

  it('links semantic-versioned modules to their current version instead of a missing latest route', () => {
    const semanticVersionChange = {
      ...baseChange,
      moduleName: 'SimpleAFK',
      title: 'New Module: SimpleAFK',
    };

    render(
      <GlobalChangelog
        changes={[semanticVersionChange]}
        modules={[moduleWithVersion('SimpleAFK', ['1.0.1'])]}
      />,
    );

    expect(
      screen.getByRole('link', { name: 'View SimpleAFK module' }),
    ).toHaveAttribute('href', '/module/SimpleAFK/1.0.1');
  });

  it('does not render broken links for changelog entries missing from the catalog', () => {
    render(<GlobalChangelog changes={[baseChange]} modules={[]} />);

    expect(
      screen.queryByRole('link', { name: 'View Ranking_Sezonowy module' }),
    ).not.toBeInTheDocument();
    expect(screen.getByText('Ranking_Sezonowy')).toBeInTheDocument();
    expect(
      screen.getByLabelText('Ranking_Sezonowy changelog entry'),
    ).toBeInTheDocument();
  });
});
