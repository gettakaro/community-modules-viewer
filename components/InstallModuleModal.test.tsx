/**
 * Tests for InstallModuleModal component
 * Phase 5: Server Selection Modal
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { InstallModuleModal } from './InstallModuleModal';
import * as takaroApi from '@/utils/takaroApi';
import { toast } from 'react-hot-toast';
import type { GameServer } from '@/lib/types';

// Mock the takaroApi module
vi.mock('@/utils/takaroApi');

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  toast: {
    error: vi.fn(),
  },
  Toaster: () => null,
}));

// Mock window.open
const mockWindowOpen = vi.fn();
global.window.open = mockWindowOpen;

const mockGameServers: GameServer[] = [
  { id: 'server-1', name: 'Test Server 1', gameType: '7d2d' },
  { id: 'server-2', name: 'Test Server 2', gameType: 'rust' },
];

describe('InstallModuleModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not render when isOpen is false', () => {
    const { container } = render(
      <InstallModuleModal
        isOpen={false}
        onClose={vi.fn()}
        moduleId="module-123"
        moduleVersion="1.0.0"
      />,
    );
    expect(container.textContent).toBe('');
  });

  it('fetches game servers on mount when open', async () => {
    vi.spyOn(takaroApi, 'getGameServers').mockResolvedValue({
      success: true,
      servers: mockGameServers,
    });

    render(
      <InstallModuleModal
        isOpen={true}
        onClose={vi.fn()}
        moduleId="module-123"
        moduleVersion="1.0.0"
      />,
    );

    expect(takaroApi.getGameServers).toHaveBeenCalled();
  });

  it('shows loading spinner while fetching servers', async () => {
    vi.spyOn(takaroApi, 'getGameServers').mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () => resolve({ success: true, servers: mockGameServers }),
            100,
          ),
        ),
    );

    render(
      <InstallModuleModal
        isOpen={true}
        onClose={vi.fn()}
        moduleId="module-123"
        moduleVersion="1.0.0"
      />,
    );

    expect(screen.getByText('Loading your servers...')).toBeInTheDocument();
  });

  it('displays server dropdown when servers loaded', async () => {
    vi.spyOn(takaroApi, 'getGameServers').mockResolvedValue({
      success: true,
      servers: mockGameServers,
    });

    render(
      <InstallModuleModal
        isOpen={true}
        onClose={vi.fn()}
        moduleId="module-123"
        moduleVersion="1.0.0"
      />,
    );

    await waitFor(() => {
      expect(screen.getByText('Choose a server...')).toBeInTheDocument();
    });

    expect(screen.getByText('Test Server 1 (7d2d)')).toBeInTheDocument();
    expect(screen.getByText('Test Server 2 (rust)')).toBeInTheDocument();
  });

  it('enables install button only when server selected', async () => {
    vi.spyOn(takaroApi, 'getGameServers').mockResolvedValue({
      success: true,
      servers: mockGameServers,
    });

    const { getByRole } = render(
      <InstallModuleModal
        isOpen={true}
        onClose={vi.fn()}
        moduleId="module-123"
        moduleVersion="1.0.0"
      />,
    );

    await waitFor(() => {
      expect(screen.getByText('Choose a server...')).toBeInTheDocument();
    });

    // Initially, install button should be disabled (showing "Select a server")
    const initialButton = getByRole('button', { name: /select a server/i });
    expect(initialButton).toBeDisabled();

    // Select a server
    const select = getByRole('combobox');
    select.dispatchEvent(
      new Event('change', { bubbles: true, cancelable: true }),
    );
    Object.defineProperty(select, 'value', {
      writable: true,
      value: 'server-1',
    });
    select.dispatchEvent(
      new Event('change', { bubbles: true, cancelable: true }),
    );

    await waitFor(() => {
      const installButton = getByRole('button', {
        name: /install on test server 1/i,
      });
      expect(installButton).not.toBeDisabled();
    });
  });

  it('generates correct installation URL pattern', async () => {
    vi.spyOn(takaroApi, 'getGameServers').mockResolvedValue({
      success: true,
      servers: mockGameServers,
    });

    const { getByRole } = render(
      <InstallModuleModal
        isOpen={true}
        onClose={vi.fn()}
        moduleId="module-123"
        moduleVersion="1.0.0"
      />,
    );

    await waitFor(() => {
      expect(screen.getByText('Choose a server...')).toBeInTheDocument();
    });

    // Select a server
    const select = getByRole('combobox');
    Object.defineProperty(select, 'value', {
      writable: true,
      value: 'server-1',
    });
    select.dispatchEvent(
      new Event('change', { bubbles: true, cancelable: true }),
    );

    await waitFor(() => {
      const installButton = getByRole('button', {
        name: /install on test server 1/i,
      });
      expect(installButton).toBeInTheDocument();
    });

    const installButton = getByRole('button', {
      name: /install on test server 1/i,
    });
    installButton.click();

    expect(mockWindowOpen).toHaveBeenCalledWith(
      'https://dashboard.takaro.io/gameserver/server-1/modules/module-123/1.0.0/install',
      '_blank',
    );
  });

  it('opens installation URL in new tab on install click', async () => {
    vi.spyOn(takaroApi, 'getGameServers').mockResolvedValue({
      success: true,
      servers: mockGameServers,
    });

    const { getByRole } = render(
      <InstallModuleModal
        isOpen={true}
        onClose={vi.fn()}
        moduleId="module-123"
        moduleVersion="1.0.0"
      />,
    );

    await waitFor(() => {
      expect(screen.getByText('Choose a server...')).toBeInTheDocument();
    });

    // Select a server
    const select = getByRole('combobox');
    Object.defineProperty(select, 'value', {
      writable: true,
      value: 'server-2',
    });
    select.dispatchEvent(
      new Event('change', { bubbles: true, cancelable: true }),
    );

    await waitFor(() => {
      const installButton = getByRole('button', {
        name: /install on test server 2/i,
      });
      expect(installButton).toBeInTheDocument();
    });

    const installButton = getByRole('button', {
      name: /install on test server 2/i,
    });
    installButton.click();

    // Verify window.open was called with correct params
    expect(mockWindowOpen).toHaveBeenCalledWith(
      expect.stringContaining(
        'https://dashboard.takaro.io/gameserver/server-2',
      ),
      '_blank',
    );
  });

  it('shows message when no servers available', async () => {
    vi.spyOn(takaroApi, 'getGameServers').mockResolvedValue({
      success: true,
      servers: [],
    });

    render(
      <InstallModuleModal
        isOpen={true}
        onClose={vi.fn()}
        moduleId="module-123"
        moduleVersion="1.0.0"
      />,
    );

    await waitFor(() => {
      expect(screen.getByText(/no game servers found/i)).toBeInTheDocument();
    });

    expect(screen.getByText('Open Takaro Dashboard →')).toBeInTheDocument();
  });

  it('calls onClose when Install Later clicked', async () => {
    vi.spyOn(takaroApi, 'getGameServers').mockResolvedValue({
      success: true,
      servers: mockGameServers,
    });

    const onCloseMock = vi.fn();
    const { getByRole } = render(
      <InstallModuleModal
        isOpen={true}
        onClose={onCloseMock}
        moduleId="module-123"
        moduleVersion="1.0.0"
      />,
    );

    await waitFor(() => {
      expect(screen.getByText('Choose a server...')).toBeInTheDocument();
    });

    const installLaterButton = getByRole('button', {
      name: /install later/i,
    });
    installLaterButton.click();

    expect(onCloseMock).toHaveBeenCalled();
  });

  it('calls onClose when close button (X) is clicked', async () => {
    vi.spyOn(takaroApi, 'getGameServers').mockResolvedValue({
      success: true,
      servers: mockGameServers,
    });

    const onCloseMock = vi.fn();
    render(
      <InstallModuleModal
        isOpen={true}
        onClose={onCloseMock}
        moduleId="module-123"
        moduleVersion="1.0.0"
      />,
    );

    await waitFor(() => {
      expect(screen.getByText('Choose a server...')).toBeInTheDocument();
    });

    const closeButton = screen.getByLabelText('Close modal');
    closeButton.click();

    expect(onCloseMock).toHaveBeenCalled();
  });

  it('shows toast error when server fetch fails', async () => {
    vi.spyOn(takaroApi, 'getGameServers').mockResolvedValue({
      success: false,
      error: 'Network error',
    });

    render(
      <InstallModuleModal
        isOpen={true}
        onClose={vi.fn()}
        moduleId="module-123"
        moduleVersion="1.0.0"
      />,
    );

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to load servers');
    });
  });

  it('calls onClose after successful install button click', async () => {
    vi.spyOn(takaroApi, 'getGameServers').mockResolvedValue({
      success: true,
      servers: mockGameServers,
    });

    const onCloseMock = vi.fn();
    const { getByRole } = render(
      <InstallModuleModal
        isOpen={true}
        onClose={onCloseMock}
        moduleId="module-123"
        moduleVersion="1.0.0"
      />,
    );

    await waitFor(() => {
      expect(screen.getByText('Choose a server...')).toBeInTheDocument();
    });

    // Select a server
    const select = getByRole('combobox');
    Object.defineProperty(select, 'value', {
      writable: true,
      value: 'server-1',
    });
    select.dispatchEvent(
      new Event('change', { bubbles: true, cancelable: true }),
    );

    await waitFor(() => {
      const installButton = getByRole('button', {
        name: /install on test server 1/i,
      });
      expect(installButton).toBeInTheDocument();
    });

    const installButton = getByRole('button', {
      name: /install on test server 1/i,
    });
    installButton.click();

    expect(onCloseMock).toHaveBeenCalled();
  });
});
