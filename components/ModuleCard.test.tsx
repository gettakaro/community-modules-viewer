import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ModuleCard } from './ModuleCard';
import type { ModuleWithMeta } from '@/lib/types';

const mockModule: ModuleWithMeta = {
  name: 'test-module',
  source: 'community',
  takaroVersion: '1.0.0',
  path: '/modules/test-module.json',
  category: 'testing',
  versions: [
    {
      tag: 'latest',
      description: 'Test module description',
      configSchema: '{}',
      uiSchema: '{}',
      commands: [],
      hooks: [],
      cronJobs: [],
      permissions: [],
      functions: [],
    },
  ],
};

describe('ModuleCard crawlability', () => {
  it('renders a crawlable link when href is provided', () => {
    render(<ModuleCard module={mockModule} href="/module/test-module" />);

    const link = screen.getByRole('link', { name: 'Module: test-module' });

    expect(link).toHaveAttribute('href', '/module/test-module');
  });

  it('calls onClick from the crawlable link without losing href', () => {
    const onClick = vi.fn();
    render(
      <ModuleCard
        module={mockModule}
        href="/module/test-module"
        onClick={onClick}
      />,
    );

    const link = screen.getByRole('link', { name: 'Module: test-module' });
    link.click();

    expect(link).toHaveAttribute('href', '/module/test-module');
    expect(onClick).toHaveBeenCalledWith(mockModule);
  });
});
