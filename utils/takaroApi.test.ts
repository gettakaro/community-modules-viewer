/**
 * Tests for Takaro API Client
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { checkAuthStatus, importModule, getGameServers } from './takaroApi';
import { Client } from '@takaro/apiclient';

// Mock the @takaro/apiclient module
vi.mock('@takaro/apiclient', () => {
  const mockClient = {
    user: {
      userControllerMe: vi.fn(),
    },
    module: {
      moduleControllerImport: vi.fn(),
    },
    gameserver: {
      gameServerControllerSearch: vi.fn(),
    },
  };

  return {
    Client: vi.fn(() => mockClient),
  };
});

describe('TakaroApiClient', () => {
  let mockClientInstance: {
    user: { userControllerMe: ReturnType<typeof vi.fn> };
    module: { moduleControllerImport: ReturnType<typeof vi.fn> };
    gameserver: { gameServerControllerSearch: ReturnType<typeof vi.fn> };
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Access the mocked client instance
    mockClientInstance = new Client({ url: 'test', auth: {} }) as any;
  });

  describe('checkAuthStatus', () => {
    it('returns authenticated when userControllerMe succeeds', async () => {
      mockClientInstance.user.userControllerMe.mockResolvedValue({
        data: {
          id: 'user-123',
          name: 'Test User',
          email: 'test@example.com',
        },
      });

      const result = await checkAuthStatus();

      expect(result.isAuthenticated).toBe(true);
      expect(result.user).toEqual({
        id: 'user-123',
        name: 'Test User',
        email: 'test@example.com',
      });
      expect(mockClientInstance.user.userControllerMe).toHaveBeenCalled();
    });

    it('returns unauthenticated on 401 error', async () => {
      mockClientInstance.user.userControllerMe.mockRejectedValue({
        response: { status: 401 },
      });

      const result = await checkAuthStatus();

      expect(result.isAuthenticated).toBe(false);
      expect(result.user).toBeUndefined();
    });

    it('throws on network error', async () => {
      mockClientInstance.user.userControllerMe.mockRejectedValue(
        new Error('Network error'),
      );

      await expect(checkAuthStatus()).rejects.toThrow('Network error');
    });
  });

  describe('importModule', () => {
    it('calls moduleControllerImport and returns success with module ID', async () => {
      mockClientInstance.module.moduleControllerImport.mockResolvedValue({
        data: {
          id: 'module-456',
        },
      });

      const moduleData = {
        name: 'Test Module',
        description: 'Test description',
      };

      const result = await importModule(moduleData);

      expect(result.success).toBe(true);
      expect(result.id).toBe('module-456');
      expect(
        mockClientInstance.module.moduleControllerImport,
      ).toHaveBeenCalledWith(moduleData);
    });

    it('returns error on API validation failure', async () => {
      mockClientInstance.module.moduleControllerImport.mockRejectedValue(
        new Error('Validation failed'),
      );

      const result = await importModule({ name: 'Invalid' });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Validation failed');
    });
  });

  describe('getGameServers', () => {
    it('calls gameServerControllerSearch and returns server list', async () => {
      const mockServers = [
        { id: 'server-1', name: 'Test Server 1', gameType: '7d2d' },
        { id: 'server-2', name: 'Test Server 2', gameType: 'rust' },
      ];

      mockClientInstance.gameserver.gameServerControllerSearch.mockResolvedValue(
        {
          data: {
            data: mockServers,
          },
        },
      );

      const result = await getGameServers();

      expect(result.success).toBe(true);
      expect(result.servers).toEqual(mockServers);
      expect(
        mockClientInstance.gameserver.gameServerControllerSearch,
      ).toHaveBeenCalled();
    });

    it('returns error on fetch failure', async () => {
      mockClientInstance.gameserver.gameServerControllerSearch.mockRejectedValue(
        new Error('Failed to fetch servers'),
      );

      const result = await getGameServers();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to fetch servers');
    });
  });
});
