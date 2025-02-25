import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Page from '../page';

// Mock react's cache function
vi.mock('react', async () => {
  const actual = await vi.importActual('react');
  return {
    ...actual,
    cache: (fn) => fn,
  };
});

// Mock filesystem operations
vi.mock('fs', () => ({
  default: {
    readdirSync: () => ['test-module.json'],
    readFileSync: () => JSON.stringify({
      name: 'Test Module',
      description: 'A test module',
      version: '1.0.0',
      author: 'Test Author',
      commands: []
    })
  }
}));

describe('Page', () => {
  it('renders without crashing', () => {
    render(<Page />);
  });

  it('contains the main element', () => {
    render(<Page />);
    const mainElement = screen.getByRole('main');
    expect(mainElement).toBeInTheDocument();
  });

  it('displays the heading', () => {
    render(<Page />);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent(/community modules/i);
  });
});