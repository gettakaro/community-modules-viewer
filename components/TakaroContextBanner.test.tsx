import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TakaroContextBanner } from './TakaroContextBanner';

describe('TakaroContextBanner', () => {
  it('keeps Takaro context visible with responsive actions', () => {
    render(<TakaroContextBanner />);

    expect(
      screen.getByRole('heading', { name: 'Takaro Modules' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Takaro is a game server management platform/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Visit takaro.io' }),
    ).toHaveAttribute('href', 'https://takaro.io');
    expect(
      screen.getByRole('link', { name: 'Back to module library' }),
    ).toHaveAttribute('href', '/');
    expect(screen.getByTestId('takaro-context-actions')).toHaveClass(
      'flex-col',
      'sm:flex-row',
    );
  });
});
