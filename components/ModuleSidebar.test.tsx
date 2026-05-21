import React from 'react';
import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ModuleSidebar } from './ModuleSidebar';
import type { ModuleWithMeta } from '@/lib/types';

const modules: ModuleWithMeta[] = [
  {
    name: 'BlackJack',
    source: 'community',
    takaroVersion: '1.0.0',
    category: 'minigames',
    author: 'Limon',
    supportedGames: ['7d2d'],
    versions: [
      {
        tag: 'latest',
        description: 'Card game',
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
    name: 'ProfanityFilter',
    source: 'community',
    takaroVersion: '1.0.0',
    category: 'anti-cheat',
    author: 'Mad',
    supportedGames: ['rust'],
    versions: [
      {
        tag: 'latest',
        description: 'Chat moderation',
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

describe('ModuleSidebar filter controls', () => {
  it('uses labeled select controls and summarizes active filters', async () => {
    render(<ModuleSidebar modules={modules} />);

    const categorySelect = await screen.findByLabelText('Category');
    expect(categorySelect).toHaveDisplayValue('All categories');
    expect(screen.getByLabelText('Author')).toHaveDisplayValue('All authors');
    expect(screen.getByLabelText('Supported game')).toHaveDisplayValue(
      'All games',
    );

    fireEvent.change(categorySelect, { target: { value: 'minigames' } });

    await waitFor(() => {
      expect(screen.getByTestId('search-results-count')).toHaveTextContent(
        'Showing 1 of 2 modules',
      );
    });
    expect(screen.getByText('Category: Minigames')).toBeInTheDocument();
    expect(screen.queryByTestId('category-group-anti-cheat')).toBeNull();
    expect(screen.getByTestId('category-group-minigames')).toBeInTheDocument();
  });
});
