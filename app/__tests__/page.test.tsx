import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Page from '../page';

// Mock the modules data
const defaultModule = {
  name: 'Test Module',
  description: 'A test module',
  version: '1.0.0',
  author: 'Test Author',
  commands: []
};

// Mock the modules utility
vi.mock('../utils/modules', () => ({
  getModules: vi.fn().mockReturnValue([defaultModule])
}));

// Import the mocked module
import { getModules } from '../utils/modules';
const mockedGetModules = vi.mocked(getModules);

describe('Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedGetModules.mockReturnValue([defaultModule]);
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
    const moduleAuthor = await screen.findByText('by Test Author');

    expect(moduleName).toBeInTheDocument();
    expect(moduleDescription).toBeInTheDocument();
    expect(moduleVersion).toBeInTheDocument();
    expect(moduleAuthor).toBeInTheDocument();
  });

  it('handles modules with missing fields', async () => {
    // Mock module with missing fields
    mockedGetModules.mockReturnValueOnce([{
      name: 'Minimal Module'
    }]);

    render(<Page />);
    
    const moduleName = await screen.findByText('Minimal Module');
    expect(moduleName).toBeInTheDocument();
    expect(await screen.findByText('by Unknown')).toBeInTheDocument(); // Default author
    expect(await screen.findByText('v0.0.0')).toBeInTheDocument(); // Default version
  });
});