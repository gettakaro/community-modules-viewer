import React from 'react';
import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { HomeContent } from './HomeContent';
import { CategoryFilterProvider } from './CategoryFilterContext';
import type { ModuleWithMeta } from '@/lib/types';

const modules: ModuleWithMeta[] = [
  {
    name: 'economy-module',
    source: 'community',
    takaroVersion: '1.0.0',
    category: 'economy',
    supportedGames: ['7d2d'],
    versions: [
      {
        tag: 'latest',
        description: 'Economy tools',
        configSchema: '{}',
        uiSchema: '{}',
        commands: [],
        hooks: [],
        cronJobs: [],
        permissions: [],
        functions: [],
      },
    ],
  },
  {
    name: 'moderation-module',
    source: 'community',
    takaroVersion: '1.0.0',
    category: 'anti-cheat',
    supportedGames: ['rust'],
    versions: [
      {
        tag: 'latest',
        description: 'Moderation tools',
        configSchema: '{}',
        uiSchema: '{}',
        commands: [],
        hooks: [],
        cronJobs: [],
        permissions: [],
        functions: [],
      },
    ],
  },
];

describe('HomeContent Takaro branding', () => {
  it('frames the browser as the Takaro module library', () => {
    render(
      <CategoryFilterProvider>
        <HomeContent modules={modules} changelogs={null} />
      </CategoryFilterProvider>,
    );

    expect(
      screen.getByRole('heading', { name: 'Takaro Modules' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Takaro module library')).toBeInTheDocument();
    expect(
      screen.getByText(/Takaro is a game server management platform/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Visit takaro.io' }),
    ).toHaveAttribute('href', 'https://takaro.io');
    expect(screen.getAllByText('2')).toHaveLength(3);
    expect(screen.getByText('Total modules')).toBeInTheDocument();
    expect(screen.getByText('2 categories')).toBeInTheDocument();
    expect(screen.getByText('2 supported games')).toBeInTheDocument();
  });

  it('keeps category cards as filter entry points', () => {
    render(
      <CategoryFilterProvider>
        <HomeContent modules={modules} changelogs={null} />
      </CategoryFilterProvider>,
    );

    fireEvent.click(screen.getByTestId('category-card-economy'));

    expect(localStorage.getItem('module-category-filter')).toBe('economy');
  });
});
