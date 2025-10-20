/**
 * Tests for ModuleDetails component - Import Button Functionality
 * Phase 3: Import Button with Auth State
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ModuleDetails } from './ModuleDetails';
import { ModuleWithMeta } from '@/lib/types';
import * as takaroApi from '@/utils/takaroApi';

// Mock the takaroApi module
vi.mock('@/utils/takaroApi');

// Mock test data
const mockCommunityModule: ModuleWithMeta = {
  name: 'test-community-module',
  source: 'community',
  takaroVersion: '1.0.0',
  path: '/home/user/project/public/modules/economy/test-module.json',
  versions: [
    {
      tag: 'latest',
      description: 'Test community module',
      configSchema: '{"type": "object"}',
      uiSchema: '{"ui:order": []}',
      commands: [],
      hooks: [],
      cronJobs: [],
      permissions: [],
      functions: [],
    },
  ],
};

const mockBuiltinModule: ModuleWithMeta = {
  name: 'test-builtin-module',
  source: 'builtin',
  takaroVersion: '1.0.0',
  versions: [
    {
      tag: 'latest',
      description: 'Test built-in module',
      configSchema: '{"type": "object"}',
      uiSchema: '{"ui:order": []}',
      commands: [],
      hooks: [],
      cronJobs: [],
      permissions: [],
      functions: [],
    },
  ],
};

describe('ModuleDetails Import Button', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mocks to default state
    vi.spyOn(takaroApi, 'checkAuthStatus').mockResolvedValue({
      isAuthenticated: false,
    });
  });

  describe('Loading state', () => {
    it('shows loading state during auth check', async () => {
      // Mock checkAuthStatus to never resolve (simulating loading)
      const mockCheckAuthStatus = vi
        .spyOn(takaroApi, 'checkAuthStatus')
        .mockImplementation(
          () =>
            new Promise(() => {
              // Never resolves
            }),
        );

      render(<ModuleDetails module={mockCommunityModule} />);

      // Should show loading button
      const loadingButton = screen.getByTestId('import-button-loading');
      expect(loadingButton).toBeInTheDocument();
      expect(loadingButton).toBeDisabled();
      expect(loadingButton).toHaveAttribute(
        'title',
        'Checking authentication...',
      );

      mockCheckAuthStatus.mockRestore();
    });
  });

  describe('Unauthenticated state', () => {
    it('shows disabled button when unauthenticated with tooltip', async () => {
      // Mock checkAuthStatus to return unauthenticated
      vi.spyOn(takaroApi, 'checkAuthStatus').mockResolvedValue({
        isAuthenticated: false,
      });

      render(<ModuleDetails module={mockCommunityModule} />);

      // Wait for auth check to complete
      await waitFor(() => {
        const button = screen.getByTestId('import-button-unauthenticated');
        expect(button).toBeInTheDocument();
        expect(button).toBeDisabled();
        expect(button).toHaveAttribute(
          'title',
          'Please log in to your Takaro account first',
        );
        expect(button).toHaveTextContent('Import to Takaro');
      });
    });

    it('shows disabled button for unauthenticated users on community modules only', async () => {
      vi.spyOn(takaroApi, 'checkAuthStatus').mockResolvedValue({
        isAuthenticated: false,
      });

      render(<ModuleDetails module={mockCommunityModule} />);

      await waitFor(() => {
        const button = screen.getByTestId('import-button-unauthenticated');
        expect(button).toBeInTheDocument();
      });
    });
  });

  describe('Built-in module state', () => {
    it('shows disabled button for built-in modules with tooltip', async () => {
      // Mock checkAuthStatus to return authenticated
      vi.spyOn(takaroApi, 'checkAuthStatus').mockResolvedValue({
        isAuthenticated: true,
        user: {
          id: 'test-user-id',
          name: 'Test User',
          email: 'test@example.com',
        },
      });

      render(<ModuleDetails module={mockBuiltinModule} />);

      // Wait for auth check to complete
      await waitFor(() => {
        const button = screen.getByTestId('import-button-builtin');
        expect(button).toBeInTheDocument();
        expect(button).toBeDisabled();
        expect(button).toHaveAttribute(
          'title',
          'Built-in modules are already available in Takaro',
        );
        expect(button).toHaveTextContent('Import to Takaro');
      });
    });

    it('shows disabled button for built-in modules even when unauthenticated', async () => {
      vi.spyOn(takaroApi, 'checkAuthStatus').mockResolvedValue({
        isAuthenticated: false,
      });

      render(<ModuleDetails module={mockBuiltinModule} />);

      await waitFor(() => {
        const button = screen.getByTestId('import-button-builtin');
        expect(button).toBeInTheDocument();
        expect(button).toBeDisabled();
      });
    });
  });

  describe('Authenticated state', () => {
    it('shows active button when authenticated for community modules', async () => {
      vi.spyOn(takaroApi, 'checkAuthStatus').mockResolvedValue({
        isAuthenticated: true,
        user: {
          id: 'test-user-id',
          name: 'Test User',
          email: 'test@example.com',
        },
      });

      render(<ModuleDetails module={mockCommunityModule} />);

      await waitFor(() => {
        const button = screen.getByTestId('import-button-active');
        expect(button).toBeInTheDocument();
        expect(button).not.toBeDisabled();
        expect(button).toHaveAttribute('title', 'Import module to Takaro');
        expect(button).toHaveTextContent('Import to Takaro');
      });
    });

    it('active button is clickable and has proper aria-label', async () => {
      vi.spyOn(takaroApi, 'checkAuthStatus').mockResolvedValue({
        isAuthenticated: true,
        user: {
          id: 'test-user-id',
          name: 'Test User',
          email: 'test@example.com',
        },
      });

      render(<ModuleDetails module={mockCommunityModule} />);

      await waitFor(() => {
        const button = screen.getByTestId('import-button-active');
        expect(button).toHaveAttribute('aria-label', 'Import module to Takaro');
        expect(button.tagName).toBe('BUTTON');
      });
    });
  });

  describe('Error handling', () => {
    it('shows unauthenticated state when auth check fails', async () => {
      // Mock console.error to avoid test output noise
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      vi.spyOn(takaroApi, 'checkAuthStatus').mockRejectedValue(
        new Error('Network error'),
      );

      render(<ModuleDetails module={mockCommunityModule} />);

      await waitFor(() => {
        const button = screen.getByTestId('import-button-unauthenticated');
        expect(button).toBeInTheDocument();
        expect(button).toBeDisabled();
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Auth check failed:',
        expect.any(Error),
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Button visibility logic', () => {
    it('shows only one button state at a time', async () => {
      vi.spyOn(takaroApi, 'checkAuthStatus').mockResolvedValue({
        isAuthenticated: true,
        user: {
          id: 'test-user-id',
          name: 'Test User',
          email: 'test@example.com',
        },
      });

      render(<ModuleDetails module={mockCommunityModule} />);

      // Initially loading
      expect(screen.getByTestId('import-button-loading')).toBeInTheDocument();

      // After auth check, only active button should be visible
      await waitFor(() => {
        expect(screen.getByTestId('import-button-active')).toBeInTheDocument();
        expect(
          screen.queryByTestId('import-button-loading'),
        ).not.toBeInTheDocument();
        expect(
          screen.queryByTestId('import-button-unauthenticated'),
        ).not.toBeInTheDocument();
        expect(
          screen.queryByTestId('import-button-builtin'),
        ).not.toBeInTheDocument();
      });
    });
  });

  describe('Export button coexistence', () => {
    it('shows both import and export buttons', async () => {
      vi.spyOn(takaroApi, 'checkAuthStatus').mockResolvedValue({
        isAuthenticated: true,
        user: {
          id: 'test-user-id',
          name: 'Test User',
          email: 'test@example.com',
        },
      });

      render(<ModuleDetails module={mockCommunityModule} />);

      await waitFor(() => {
        expect(screen.getByTestId('import-button-active')).toBeInTheDocument();
        expect(screen.getByTestId('export-button')).toBeInTheDocument();
      });
    });
  });
});
