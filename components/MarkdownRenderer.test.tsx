import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.unmock('react-markdown');

import { MarkdownRenderer } from './MarkdownRenderer';

describe('MarkdownRenderer', () => {
  it('renders GitHub-flavored Markdown tables instead of raw pipe syntax', () => {
    render(
      <MarkdownRenderer
        content={[
          '| Command | Purpose |',
          '|---|---|',
          '| `/fund` | Contribute to the community fund. |',
        ].join('\n')}
      />,
    );

    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', { name: 'Command' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: '/fund' })).toBeInTheDocument();
    expect(screen.queryByText('| Command | Purpose |')).not.toBeInTheDocument();
  });
});
