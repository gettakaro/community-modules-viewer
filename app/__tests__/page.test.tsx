import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Page from '../page';
import fs from 'fs';

// Mock react's cache function
vi.mock('react', async () => {
  const actual = await vi.importActual('react');
  return {
    ...actual,
    cache: (fn) => fn,
  };
});

vi.mock('fs', () => {
  const mockReadFileSync = vi.fn().mockReturnValue(JSON.stringify({
    name: 'Test Module',
    description: 'A test module',
    version: '1.0.0',
    author: 'Test Author',
    commands: []
  }));

  return {
    default: {
      readdirSync: vi.fn().mockReturnValue(['test-module.json']),
      readFileSync: mockReadFileSync
    },
    readdirSync: vi.fn().mockReturnValue(['test-module.json']),
    readFileSync: mockReadFileSync
  };
});

// Get the mocked fs module
const mockedFs = vi.mocked(fs);

describe('Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

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

  it('displays module information', async () => {
    render(<Page />);
    
    // Wait for module info to appear
    const moduleName = await screen.findByText('Test Module');
    const moduleDescription = await screen.findByText('A test module');
    const moduleVersion = await screen.findByText('v1.0.0');
    const moduleAuthor = await screen.findByText('Test Author');

    expect(moduleName).toBeInTheDocument();
    expect(moduleDescription).toBeInTheDocument();
    expect(moduleVersion).toBeInTheDocument();
    expect(moduleAuthor).toBeInTheDocument();
  });

  it('handles modules with missing fields', async () => {
    // Mock module with missing fields
    mockedFs.readFileSync.mockReturnValueOnce(JSON.stringify({
      name: 'Minimal Module'
    }));

    render(<Page />);
    
    const moduleName = await screen.findByText('Minimal Module');
    expect(moduleName).toBeInTheDocument();
    expect(await screen.findByText('by Unknown')).toBeInTheDocument(); // Default author
    expect(await screen.findByText('v0.0.0')).toBeInTheDocument(); // Default version
  });
});