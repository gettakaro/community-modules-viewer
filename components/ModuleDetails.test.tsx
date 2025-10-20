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
import { toast } from 'react-hot-toast';

// Mock the takaroApi module
vi.mock('@/utils/takaroApi');

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  toast: {
    loading: vi.fn().mockReturnValue('toast-id'),
    success: vi.fn(),
    error: vi.fn(),
  },
  Toaster: () => null,
}));

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

  describe('Import functionality (Phase 4)', () => {
    beforeEach(() => {
      // Mock fetch for module JSON
      global.fetch = vi.fn();

      // Clear mock toast calls
      vi.clearAllMocks();

      // Mock console.log to avoid test output noise
      vi.spyOn(console, 'log').mockImplementation(() => {});

      // Mock getGameServers for InstallModuleModal
      vi.spyOn(takaroApi, 'getGameServers').mockResolvedValue({
        success: true,
        servers: [
          { id: 'server-1', name: 'Test Server', gameType: '7d2d' },
        ],
      });
    });

    it('calls handleImportClick when import button is clicked', async () => {
      vi.spyOn(takaroApi, 'checkAuthStatus').mockResolvedValue({
        isAuthenticated: true,
        user: {
          id: 'test-user-id',
          name: 'Test User',
          email: 'test@example.com',
        },
      });

      // Mock fetch to return module JSON
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => mockCommunityModule,
      });

      // Mock importModule to succeed
      vi.spyOn(takaroApi, 'importModule').mockResolvedValue({
        success: true,
        id: 'imported-module-123',
      });

      const { getByTestId } = render(
        <ModuleDetails module={mockCommunityModule} />,
      );

      // Wait for auth check to complete
      await waitFor(() => {
        expect(getByTestId('import-button-active')).toBeInTheDocument();
      });

      // Click the import button
      const importButton = getByTestId('import-button-active');
      importButton.click();

      // Verify importModule was called
      await waitFor(() => {
        expect(takaroApi.importModule).toHaveBeenCalled();
      });
    });

    it('shows loading toast during import', async () => {
      vi.spyOn(takaroApi, 'checkAuthStatus').mockResolvedValue({
        isAuthenticated: true,
        user: { id: 'test', name: 'Test', email: 'test@test.com' },
      });

      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => mockCommunityModule,
      });

      vi.spyOn(takaroApi, 'importModule').mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve({ success: true, id: 'test-id' }), 100);
          }),
      );

      const { getByTestId } = render(
        <ModuleDetails module={mockCommunityModule} />,
      );

      await waitFor(() => {
        expect(getByTestId('import-button-active')).toBeInTheDocument();
      });

      getByTestId('import-button-active').click();

      await waitFor(() => {
        expect(toast.loading).toHaveBeenCalledWith('Importing module...');
      });
    });

    it('shows success toast on successful import', async () => {
      vi.spyOn(takaroApi, 'checkAuthStatus').mockResolvedValue({
        isAuthenticated: true,
        user: { id: 'test', name: 'Test', email: 'test@test.com' },
      });

      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => mockCommunityModule,
      });

      vi.spyOn(takaroApi, 'importModule').mockResolvedValue({
        success: true,
        id: 'imported-module-123',
      });

      const { getByTestId } = render(
        <ModuleDetails module={mockCommunityModule} />,
      );

      await waitFor(() => {
        expect(getByTestId('import-button-active')).toBeInTheDocument();
      });

      getByTestId('import-button-active').click();

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(
          'Module imported successfully!',
          { id: 'toast-id' },
        );
      });
    });

    it('shows error toast on failed import', async () => {
      vi.spyOn(takaroApi, 'checkAuthStatus').mockResolvedValue({
        isAuthenticated: true,
        user: { id: 'test', name: 'Test', email: 'test@test.com' },
      });

      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => mockCommunityModule,
      });

      vi.spyOn(takaroApi, 'importModule').mockResolvedValue({
        success: false,
        error: 'Validation failed',
      });

      const { getByTestId } = render(
        <ModuleDetails module={mockCommunityModule} />,
      );

      await waitFor(() => {
        expect(getByTestId('import-button-active')).toBeInTheDocument();
      });

      getByTestId('import-button-active').click();

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          'Import failed: Validation failed',
          { id: 'toast-id' },
        );
      });
    });

    it('handles fetch errors gracefully', async () => {
      vi.spyOn(takaroApi, 'checkAuthStatus').mockResolvedValue({
        isAuthenticated: true,
        user: { id: 'test', name: 'Test', email: 'test@test.com' },
      });

      (global.fetch as any).mockResolvedValue({
        ok: false,
      });

      const { getByTestId } = render(
        <ModuleDetails module={mockCommunityModule} />,
      );

      await waitFor(() => {
        expect(getByTestId('import-button-active')).toBeInTheDocument();
      });

      getByTestId('import-button-active').click();

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          'Import failed: Failed to fetch module data',
          { id: 'toast-id' },
        );
      });
    });
  });
});
