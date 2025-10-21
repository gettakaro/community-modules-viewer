/**
 * Takaro API Client
 * Wrapper around @takaro/apiclient for module import functionality
 */

import { Client } from '@takaro/apiclient';
import type {
  AuthCheckResult,
  ImportResult,
  GameServerResult,
} from '@/lib/types';

/**
 * Singleton client instance
 */
let clientInstance: Client | null = null;

/**
 * Get the configured Takaro API URL
 * Uses build-time environment variable from process.env
 */
function getApiUrl(): string {
  return process.env.NEXT_PUBLIC_TAKARO_API_URL || 'https://api.takaro.io';
}

/**
 * Get the configured Takaro Dashboard URL
 * Uses build-time environment variable from process.env
 */
export function getDashboardUrl(): string {
  return (
    process.env.NEXT_PUBLIC_TAKARO_DASHBOARD_URL ||
    'https://dashboard.takaro.io'
  );
}

/**
 * Get or create Takaro API client instance
 * Uses cookie-based authentication from existing browser session
 * No explicit login needed - cookies are sent automatically by browser
 */
function getClient(): Client {
  if (!clientInstance) {
    // For cookie-based auth, we provide empty credentials
    // The browser will automatically send session cookies
    clientInstance = new Client({
      url: getApiUrl(),
      auth: {},
    });
  }
  return clientInstance;
}

/**
 * Check if user is authenticated with Takaro
 * Uses existing browser session cookies
 *
 * @returns Auth status and user data if authenticated
 */
export async function checkAuthStatus(): Promise<AuthCheckResult> {
  try {
    const client = getClient();
    const response = await client.user.userControllerMe();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = response.data as any;
    return {
      isAuthenticated: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };
  } catch (error: unknown) {
    const err = error as { response?: { status?: number } };
    if (err.response?.status === 401) {
      return { isAuthenticated: false };
    }
    // Network or other errors bubble up
    throw error;
  }
}

/**
 * Find module by name in user's Takaro account
 *
 * @param moduleName - Name of the module to search for
 * @returns Module ID if found, null otherwise
 */
async function findModuleByName(moduleName: string): Promise<string | null> {
  try {
    const client = getClient();
    const response = await client.module.moduleControllerSearch({
      filters: {
        name: [moduleName],
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const modules = (response.data as any)?.data || [];

    if (modules.length > 0) {
      return modules[0].id;
    }

    return null;
  } catch (error: unknown) {
    // If search fails, return null to proceed with import attempt
    console.error('Module search failed:', error);
    return null;
  }
}

/**
 * Import module to Takaro via API
 * First checks if module already exists to prevent duplicates
 *
 * @param moduleData - Module data in Takaro API format
 * @returns Import result with module ID on success
 */
export async function importModule(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  moduleData: any,
): Promise<ImportResult> {
  try {
    // First, check if module already exists
    const existingModuleId = await findModuleByName(moduleData.name);

    if (existingModuleId) {
      return {
        success: true,
        id: existingModuleId,
        alreadyExists: true,
      };
    }

    // Module doesn't exist, proceed with import
    const client = getClient();
    const response = await client.module.moduleControllerImport(moduleData);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = response.data as any;

    return {
      success: true,
      id: result.data?.id,
      alreadyExists: false,
    };
  } catch (error: unknown) {
    const err = error as { message?: string };
    return {
      success: false,
      error: err.message || 'Import failed',
    };
  }
}

/**
 * Get list of user's game servers
 *
 * @returns List of game servers or error
 */
export async function getGameServers(): Promise<GameServerResult> {
  try {
    const client = getClient();
    const response = await client.gameserver.gameServerControllerSearch();
    const serverList = response.data?.data || [];
    // Map API response to our GameServer type
    const servers = serverList.map((server) => ({
      id: server.id,
      name: server.name,
      gameType: server.type, // API uses 'type' field
    }));
    return {
      success: true,
      servers,
    };
  } catch (error: unknown) {
    const err = error as { message?: string };
    return {
      success: false,
      error: err.message || 'Failed to fetch servers',
    };
  }
}
