# Implementation Tasks: Direct Takaro Module Import via API

## Overview

We're building a one-click module import feature that eliminates the manual download→upload workflow. Users will click "Import to Takaro", authenticate automatically via cookies, and select a game server to install the module directly from the dashboard.

**Approach**: 6 phases from minimal skeleton to full-featured implementation with error handling and testing.

**Key Technologies**: `@takaro/apiclient`, `react-hot-toast`, `next-runtime-env`

---

## Phase 1: Foundation - Dependencies & Configuration

**Goal**: Install dependencies and configure runtime environment
**Demo**: "At standup, I can show: Toast notifications work and environment variables load at runtime"

### Tasks

- [x] Task 1.1: Install npm dependencies
  - **Output**: Three new packages added to package.json
  - **Files**: `package.json`
  - **Verify**: `npm install` completes successfully

  ```bash
  npm install @takaro/apiclient react-hot-toast next-runtime-env
  ```

- [x] Task 1.2: Create environment configuration file
  - **Depends on**: 1.1
  - **Output**: Environment variable documentation
  - **Files**: `.env.example`
  - **Verify**: File exists and documents NEXT_PUBLIC_TAKARO_API_URL

  ```bash
  # Content:
  # Takaro API Configuration
  # Runtime configurable via next-runtime-env
  NEXT_PUBLIC_TAKARO_API_URL=https://api.takaro.io

  # For local development with Takaro dev instance
  # NEXT_PUBLIC_TAKARO_API_URL=http://localhost:13000
  ```

- [x] Task 1.3: Add PublicEnvScript to layout
  - **Depends on**: 1.1
  - **Output**: Runtime environment configuration enabled
  - **Files**: `app/layout.tsx`
  - **Verify**: Import statement and <PublicEnvScript /> in <head>

  ```typescript
  // Add imports:
  import { PublicEnvScript } from 'next-runtime-env';

  // Add inside <head> tag:
  <PublicEnvScript />
  ```

- [x] Task 1.4: Add Toaster component to layout
  - **Depends on**: 1.1, 1.3
  - **Output**: Toast notifications UI ready
  - **Files**: `app/layout.tsx`
  - **Verify**: Toaster component renders at top-right

  ```typescript
  // Add import:
  import { Toaster } from 'react-hot-toast';

  // Add before closing </body> tag:
  <Toaster position="top-right" />
  ```

- [ ] Task 1.5: Test toast notifications
  - **Depends on**: 1.4
  - **Output**: Confirmation toasts work
  - **Files**: Temporary test in any component
  - **Verify**: Toast appears when triggered
  ```typescript
  // Temporary test code:
  import { toast } from 'react-hot-toast';
  toast.success('Setup complete!');
  ```

### Phase 1 Checkpoint

- [x] Run lint: `npm run lint`
- [ ] Run build: `npm run build`
- [ ] Run dev server: `npm run docker:dev`
- [ ] Manual verification: Visit any page, see no console errors related to new packages
- [ ] **Demo ready**: Show toast notification appearing, env var accessible via `env()`

---

## Phase 2: API Client Foundation

**Goal**: Create TakaroApiClient wrapper with auth check only
**Demo**: "At standup, I can show: Auth status detected and logged to console"

### Tasks

- [x] Task 2.1: Add TypeScript type definitions
  - **Output**: New interface types for API responses
  - **Files**: `lib/types.ts`
  - **Verify**: Types compile without errors

  ```typescript
  export interface AuthCheckResult {
    isAuthenticated: boolean;
    user?: {
      id: string;
      name: string;
      email: string;
    };
  }

  export interface ImportResult {
    success: boolean;
    id?: string;
    error?: string;
  }

  export interface GameServerResult {
    success: boolean;
    servers?: GameServer[];
    error?: string;
  }

  export interface GameServer {
    id: string;
    name: string;
    gameType: string;
  }

  export type AuthState = 'loading' | 'authenticated' | 'unauthenticated';
  ```

- [x] Task 2.2: Create TakaroApiClient skeleton
  - **Depends on**: 2.1
  - **Output**: API client with auth check method only
  - **Files**: `utils/takaroApi.ts` (new file)
  - **Verify**: File imports without errors, exports checkAuthStatus function

  ```typescript
  import { Client } from '@takaro/apiclient';
  import { env } from 'next-runtime-env';
  import { AuthCheckResult } from '@/lib/types';

  let clientInstance: Client | null = null;

  function getApiUrl(): string {
    return env('NEXT_PUBLIC_TAKARO_API_URL') || 'https://api.takaro.io';
  }

  async function getClient(): Promise<Client> {
    if (!clientInstance) {
      clientInstance = new Client({ url: getApiUrl() });
      await clientInstance.login();
    }
    return clientInstance;
  }

  export async function checkAuthStatus(): Promise<AuthCheckResult> {
    try {
      const client = await getClient();
      const user = await client.user.meController();
      return { isAuthenticated: true, user: user.data };
    } catch (error: any) {
      if (error.status === 401) {
        return { isAuthenticated: false };
      }
      throw error;
    }
  }
  ```

- [ ] Task 2.3: Write unit tests for checkAuthStatus
  - **Depends on**: 2.2
  - **Output**: Test coverage for auth check
  - **Files**: `utils/takaroApi.test.ts` (new file)
  - **Verify**: Tests pass with `npm run test:unit`
  ```typescript
  describe('TakaroApiClient', () => {
    describe('checkAuthStatus', () => {
      test('returns authenticated when meController succeeds');
      test('returns unauthenticated on 401 error');
      test('throws on network error');
    });
  });
  ```

### Phase 2 Checkpoint

- [x] Run lint: `npm run lint`
- [x] Run typecheck: `npm run typecheck`
- [ ] Run unit tests: `npm run test:unit`
- [ ] Manual verification: Call checkAuthStatus() in console, verify return structure
- [ ] **Demo ready**: Console log shows auth status detection working

---

## Phase 3: Import Button with Auth State

**Goal**: Add import button to ModuleDetails that shows correct state based on auth
**Demo**: "At standup, I can show: Import button appears, enables/disables based on login, tooltips explain state"

### Tasks

- [ ] Task 3.1: Add auth state management to ModuleDetails
  - **Output**: Component tracks authentication state
  - **Files**: `components/ModuleDetails.tsx`
  - **Verify**: Component compiles, auth check runs on mount

  ```typescript
  // Add imports:
  import { checkAuthStatus } from '@/utils/takaroApi';
  import type { AuthState } from '@/lib/types';

  // Add state variables (around line 52):
  const [authState, setAuthState] = useState<AuthState>('loading');

  // Add useEffect for auth check (around line 80):
  useEffect(() => {
    async function checkAuth() {
      try {
        const result = await checkAuthStatus();
        setAuthState(
          result.isAuthenticated ? 'authenticated' : 'unauthenticated',
        );
      } catch (error) {
        console.error('Auth check failed:', error);
        setAuthState('unauthenticated');
      }
    }
    checkAuth();
  }, []);
  ```

- [ ] Task 3.2: Add import button UI with states
  - **Depends on**: 3.1
  - **Output**: Button appears next to export button with correct visual states
  - **Files**: `components/ModuleDetails.tsx` (around line 265)
  - **Verify**: Button shows different states: loading, disabled (with tooltip), enabled

  ```typescript
  // Add import button near export button (line ~265-350):
  {/* Import Button */}
  <div className="relative">
    {authState === 'loading' && (
      <button
        disabled
        className="btn btn-ghost btn-sm"
        title="Checking authentication..."
      >
        <svg className="w-5 h-5 animate-spin" /* spinner icon */>...</svg>
      </button>
    )}

    {module.source === 'builtin' && authState !== 'loading' && (
      <button
        disabled
        className="btn btn-ghost btn-sm opacity-50"
        title="Built-in modules are already available in Takaro"
      >
        <svg className="w-5 h-5">/* upload icon */</svg>
        Import to Takaro
      </button>
    )}

    {module.source !== 'builtin' && authState === 'unauthenticated' && (
      <button
        disabled
        className="btn btn-ghost btn-sm opacity-50"
        title="Please log in to your Takaro account first"
      >
        <svg className="w-5 h-5">/* upload icon */</svg>
        Import to Takaro
      </button>
    )}

    {module.source !== 'builtin' && authState === 'authenticated' && (
      <button
        className="btn btn-ghost btn-sm"
        title="Import module to Takaro"
      >
        <svg className="w-5 h-5">/* upload icon */</svg>
        Import to Takaro
      </button>
    )}
  </div>
  ```

- [ ] Task 3.3: Write component tests for button states
  - **Depends on**: 3.2
  - **Output**: Test coverage for auth-dependent UI
  - **Files**: `components/ModuleDetails.test.tsx`
  - **Verify**: Tests pass, all button states covered
  ```typescript
  describe('ModuleDetails Import Button', () => {
    test('shows loading state during auth check');
    test('shows disabled button when unauthenticated with tooltip');
    test('shows disabled button for built-in modules with tooltip');
    test('shows active button when authenticated for community modules');
  });
  ```

### Phase 3 Checkpoint

- [ ] Run lint: `npm run lint`
- [ ] Run typecheck: `npm run typecheck`
- [ ] Run tests: `npm run test:unit`
- [ ] Manual verification: View module detail page, button appears with correct state
- [ ] Manual verification: Hover over disabled button, tooltip appears
- [ ] **Demo ready**: Show import button in different states (loading, disabled, enabled)

---

## Phase 4: Module Import & Toast Notifications

**Goal**: Implement full import flow with toast feedback
**Demo**: "At standup, I can show: Click import, see toast notifications, module imports to Takaro"

### Tasks

- [x] Task 4.1: Add importModule method to TakaroApiClient
  - **Output**: API client can import modules
  - **Files**: `utils/takaroApi.ts`
  - **Verify**: Method exports and type-checks correctly

  ```typescript
  export async function importModule(moduleData: any): Promise<ImportResult> {
    try {
      const client = await getClient();
      const result = await client.module.moduleControllerImport(moduleData);
      return { success: true, id: result.data.id };
    } catch (error: any) {
      return { success: false, error: error.message || 'Import failed' };
    }
  }
  ```

- [x] Task 4.2: Create module data transformer
  - **Depends on**: 4.1
  - **Output**: Transform viewer format to API format
  - **Files**: `utils/moduleTransform.ts` (new file)
  - **Verify**: Transformation preserves all required fields

  ```typescript
  import type { ModuleWithMeta } from '@/lib/types';

  export function transformModuleForApi(module: ModuleWithMeta) {
    const latestVersion =
      module.versions.find((v) => v.tag === 'latest') || module.versions[0];

    return {
      name: module.name,
      author: module.author,
      supportedGames: module.supportgame ? [module.supportgame] : [],
      latestVersion: latestVersion,
    };
  }
  ```

- [x] Task 4.3: Add import handler to ModuleDetails
  - **Depends on**: 4.1, 4.2
  - **Output**: Click handler that imports module
  - **Files**: `components/ModuleDetails.tsx`
  - **Verify**: Handler connects to button, shows loading state

  ```typescript
  // Add imports:
  import { toast } from 'react-hot-toast';
  import { importModule } from '@/utils/takaroApi';
  import { transformModuleForApi } from '@/utils/moduleTransform';

  // Add state:
  const [importing, setImporting] = useState(false);
  const [importedModuleId, setImportedModuleId] = useState<string | null>(null);

  // Add handler:
  async function handleImportClick() {
    if (module.source === 'builtin') {
      return; // Button already disabled
    }

    setImporting(true);
    const toastId = toast.loading('Importing module...');

    try {
      // Fetch module JSON (reuse export logic)
      const pathMatch = module.path?.match(/public\/modules\/(.*\.json)$/);
      if (!pathMatch) {
        throw new Error('Invalid module path');
      }

      const response = await fetch(`/modules/${pathMatch[1]}`);
      if (!response.ok) {
        throw new Error('Failed to fetch module');
      }

      const moduleJson = await response.json();
      const transformedData = transformModuleForApi(moduleJson);

      // Import to Takaro
      const result = await importModule(transformedData);

      if (result.success) {
        toast.success('Module imported successfully!', { id: toastId });
        setImportedModuleId(result.id!);
        // Phase 5 will add modal here
      } else {
        toast.error(`Import failed: ${result.error}`, { id: toastId });
      }
    } catch (error: any) {
      toast.error(`Import failed: ${error.message}`, { id: toastId });
    } finally {
      setImporting(false);
    }
  }
  ```

- [x] Task 4.4: Update button to show importing state
  - **Depends on**: 4.3
  - **Output**: Button shows spinner during import
  - **Files**: `components/ModuleDetails.tsx`
  - **Verify**: Button disabled with spinner when importing

  ```typescript
  // Update authenticated button (from Phase 3):
  {module.source !== 'builtin' && authState === 'authenticated' && (
    <button
      onClick={handleImportClick}
      disabled={importing}
      className="btn btn-ghost btn-sm"
      title={importing ? "Importing..." : "Import module to Takaro"}
    >
      {importing ? (
        <svg className="w-5 h-5 animate-spin">/* spinner */</svg>
      ) : (
        <svg className="w-5 h-5">/* upload icon */</svg>
      )}
      Import to Takaro
    </button>
  )}
  ```

- [x] Task 4.5: Write tests for import functionality
  - **Depends on**: 4.4
  - **Output**: Test coverage for import flow
  - **Files**: `utils/takaroApi.test.ts`, `components/ModuleDetails.test.tsx`
  - **Verify**: All import scenarios tested

  ```typescript
  // takaroApi.test.ts:
  describe('importModule', () => {
    test('calls client.module.moduleControllerImport()');
    test('returns success with moduleId on 201 response');
    test('returns error on API validation failure');
  });

  // ModuleDetails.test.tsx:
  describe('Import Flow', () => {
    test('shows toast loading notification during import');
    test('shows toast success on successful import');
    test('shows toast error on failed import');
  });
  ```

### Phase 4 Checkpoint

- [x] Run lint: `npm run lint`
- [x] Run typecheck: `npm run typecheck`
- [x] Run tests: `npm run test:unit`
- [ ] Manual verification: Click import button, see loading toast → success toast
- [ ] Manual verification: Check Takaro dashboard to confirm module imported
- [ ] **Demo ready**: Full import flow working with toast notifications

---

## Phase 5: Server Selection Modal

**Goal**: Add modal to select game server and generate installation link
**Demo**: "At standup, I can show: After import, modal opens with server dropdown, clicking opens Takaro install page"

### Tasks

- [ ] Task 5.1: Add getGameServers method to TakaroApiClient
  - **Output**: API client can fetch user's game servers
  - **Files**: `utils/takaroApi.ts`
  - **Verify**: Method returns server list

  ```typescript
  export async function getGameServers(): Promise<GameServerResult> {
    try {
      const client = await getClient();
      const servers = await client.gameServer.gameServerControllerSearch();
      return { success: true, servers: servers.data };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to fetch servers',
      };
    }
  }
  ```

- [ ] Task 5.2: Create InstallModuleModal component skeleton
  - **Depends on**: 5.1
  - **Output**: Basic modal structure
  - **Files**: `components/InstallModuleModal.tsx` (new file)
  - **Verify**: Component renders when isOpen=true

  ```typescript
  'use client';

  import { useState, useEffect } from 'react';
  import { toast } from 'react-hot-toast';
  import { getGameServers } from '@/utils/takaroApi';
  import type { GameServer } from '@/lib/types';

  interface InstallModuleModalProps {
    isOpen: boolean;
    onClose: () => void;
    moduleId: string;
    moduleVersion: string;
  }

  export function InstallModuleModal({
    isOpen,
    onClose,
    moduleId,
    moduleVersion,
  }: InstallModuleModalProps) {
    const [gameServers, setGameServers] = useState<GameServer[]>([]);
    const [selectedServerId, setSelectedServerId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      if (isOpen) {
        fetchServers();
      }
    }, [isOpen]);

    async function fetchServers() {
      setLoading(true);
      const result = await getGameServers();
      if (result.success && result.servers) {
        setGameServers(result.servers);
      } else {
        toast.error('Failed to load servers');
      }
      setLoading(false);
    }

    function handleInstallClick() {
      if (!selectedServerId) return;

      const installUrl = `https://dashboard.takaro.io/gameserver/${selectedServerId}/modules/${moduleId}/${moduleVersion}/install`;
      window.open(installUrl, '_blank');
      onClose();
    }

    if (!isOpen) return null;

    return (
      <div className="modal-backdrop">
        <div className="modal-content">
          <h2>Module Imported Successfully!</h2>
          {/* Phase 5.3 will add full UI */}
        </div>
      </div>
    );
  }
  ```

- [ ] Task 5.3: Add modal UI with server dropdown
  - **Depends on**: 5.2
  - **Output**: Complete modal with server selection
  - **Files**: `components/InstallModuleModal.tsx`
  - **Verify**: Modal shows servers, enables install button when selected

  ```typescript
  // Inside modal-content div:
  {loading && (
    <div className="flex items-center gap-2">
      <svg className="w-5 h-5 animate-spin">/* spinner */</svg>
      <span>Loading your servers...</span>
    </div>
  )}

  {!loading && gameServers.length === 0 && (
    <p>No game servers found. Create a server in Takaro first.</p>
  )}

  {!loading && gameServers.length > 0 && (
    <>
      <p>Select a game server to install this module:</p>

      <select
        value={selectedServerId || ''}
        onChange={(e) => setSelectedServerId(e.target.value)}
        className="input-takaro"
      >
        <option value="">Choose a server...</option>
        {gameServers.map(server => (
          <option key={server.id} value={server.id}>
            {server.name} ({server.gameType})
          </option>
        ))}
      </select>

      {selectedServerId && (
        <div className="badge-takaro-secondary">
          This will open Takaro dashboard where you can configure and install the module
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={handleInstallClick}
          disabled={!selectedServerId}
          className="btn btn-primary"
        >
          Install on {gameServers.find(s => s.id === selectedServerId)?.name} →
        </button>

        <button
          onClick={onClose}
          className="btn btn-secondary"
        >
          Install Later
        </button>
      </div>
    </>
  )}
  ```

- [ ] Task 5.4: Integrate modal into ModuleDetails
  - **Depends on**: 5.3
  - **Output**: Modal opens after successful import
  - **Files**: `components/ModuleDetails.tsx`
  - **Verify**: Import → modal opens → select server → link opens

  ```typescript
  // Add imports:
  import { InstallModuleModal } from './InstallModuleModal';

  // Add state:
  const [showInstallModal, setShowInstallModal] = useState(false);

  // Update handleImportClick success block (from Phase 4):
  if (result.success) {
    toast.success('Module imported successfully!', { id: toastId });
    setImportedModuleId(result.id!);
    setShowInstallModal(true); // Add this line
  }

  // Add modal at end of component render:
  {showInstallModal && importedModuleId && (
    <InstallModuleModal
      isOpen={showInstallModal}
      onClose={() => setShowInstallModal(false)}
      moduleId={importedModuleId}
      moduleVersion={currentVersion.tag}
    />
  )}
  ```

- [ ] Task 5.5: Write tests for InstallModuleModal
  - **Depends on**: 5.4
  - **Output**: Test coverage for modal component
  - **Files**: `components/InstallModuleModal.test.tsx` (new file)
  - **Verify**: All modal interactions tested
  ```typescript
  describe('InstallModuleModal', () => {
    test('fetches game servers on mount when open');
    test('shows loading spinner while fetching servers');
    test('displays server dropdown when servers loaded');
    test('enables install button only when server selected');
    test('generates correct installation URL pattern');
    test('opens installation URL in new tab on install click');
    test('shows message when no servers available');
    test('calls onClose when Install Later clicked');
  });
  ```

### Phase 5 Checkpoint

- [ ] Run lint: `npm run lint`
- [ ] Run typecheck: `npm run typecheck`
- [ ] Run tests: `npm run test:unit`
- [ ] Manual verification: Import module → modal opens → select server → install link opens
- [ ] Manual verification: Modal shows "Install Later" button that closes modal
- [ ] **Demo ready**: Full flow from import to installation link generation

---

## Phase 6: Polish, Testing & Documentation

**Goal**: Add E2E tests, polish error handling, document feature
**Demo**: "At standup, I can show: E2E tests passing, all error scenarios handled gracefully"

### Tasks

- [ ] Task 6.1: Add E2E test for authenticated import flow
  - **Output**: Full user journey tested
  - **Files**: `tests/e2e/module-import.spec.ts` (new file)
  - **Verify**: Test passes in CI

  ```typescript
  test('authenticated user can import and select server', async ({ page }) => {
    // Mock API responses
    await page.route('**/api/me', (route) =>
      route.fulfill({ json: { id: '1', name: 'Test User' } }),
    );
    await page.route('**/api/module/import', (route) =>
      route.fulfill({ json: { id: 'module-123' } }),
    );
    await page.route('**/api/gameserver/search', (route) =>
      route.fulfill({
        json: [{ id: 'server-1', name: 'Test Server', gameType: '7d2d' }],
      }),
    );

    // Navigate and interact
    await page.goto('/modules/economy/playtime-rewards');
    await page.waitForSelector(
      'button:has-text("Import to Takaro"):not([disabled])',
    );
    await page.click('button:has-text("Import to Takaro")');

    // Verify modal opens
    await page.waitForSelector('text=Module Imported Successfully!');
    await page.selectOption('select', 'server-1');

    // Verify install button works
    const newPagePromise = page.waitForEvent('popup');
    await page.click('button:has-text("Install on")');
    const newPage = await newPagePromise;
    expect(newPage.url()).toContain(
      'dashboard.takaro.io/gameserver/server-1/modules/module-123',
    );
  });
  ```

- [ ] Task 6.2: Add E2E test for unauthenticated user
  - **Depends on**: 6.1
  - **Output**: Disabled state tested
  - **Files**: `tests/e2e/module-import.spec.ts`
  - **Verify**: Test verifies button disabled with tooltip

  ```typescript
  test('unauthenticated user sees disabled import button with tooltip', async ({
    page,
  }) => {
    await page.route('**/api/me', (route) => route.fulfill({ status: 401 }));

    await page.goto('/modules/economy/playtime-rewards');

    const importButton = page.locator('button:has-text("Import to Takaro")');
    await expect(importButton).toBeDisabled();
    await importButton.hover();
    await expect(page.locator('[title*="log in"]')).toBeVisible();
  });
  ```

- [ ] Task 6.3: Add E2E test for built-in module
  - **Depends on**: 6.2
  - **Output**: Built-in module state tested
  - **Files**: `tests/e2e/module-import.spec.ts`
  - **Verify**: Test verifies built-in modules show disabled button

  ```typescript
  test('built-in module shows disabled import button', async ({ page }) => {
    await page.goto('/modules/utils/automated-backup'); // Assuming this is built-in

    const importButton = page.locator('button:has-text("Import to Takaro")');
    await expect(importButton).toBeDisabled();
    await importButton.hover();
    await expect(page.locator('[title*="already available"]')).toBeVisible();
  });
  ```

- [ ] Task 6.4: Add E2E test for error scenarios
  - **Depends on**: 6.3
  - **Output**: Error handling tested
  - **Files**: `tests/e2e/module-import.spec.ts`
  - **Verify**: Errors show toasts, export remains available

  ```typescript
  test('import failure shows error toast and keeps export available', async ({
    page,
  }) => {
    await page.route('**/api/me', (route) =>
      route.fulfill({ json: { id: '1' } }),
    );
    await page.route('**/api/module/import', (route) =>
      route.fulfill({
        status: 400,
        json: { error: 'Validation failed' },
      }),
    );

    await page.goto('/modules/economy/playtime-rewards');
    await page.click('button:has-text("Import to Takaro")');

    await expect(
      page.locator('text=Import failed: Validation failed'),
    ).toBeVisible();
    await expect(page.locator('button:has-text("Export")')).toBeEnabled();
  });
  ```

- [ ] Task 6.5: Add error boundary for modal
  - **Output**: Graceful error handling if server fetch fails
  - **Files**: `components/InstallModuleModal.tsx`
  - **Verify**: Errors don't crash app, show user-friendly message

  ```typescript
  // Add error state and handling to fetchServers:
  const [error, setError] = useState<string | null>(null);

  async function fetchServers() {
    setLoading(true);
    setError(null);
    try {
      const result = await getGameServers();
      if (result.success && result.servers) {
        setGameServers(result.servers);
      } else {
        setError(result.error || 'Failed to load servers');
      }
    } catch (err: any) {
      setError('Unexpected error loading servers');
    } finally {
      setLoading(false);
    }
  }

  // Add error UI:
  {error && (
    <div className="text-red-500">
      {error}
      <button onClick={fetchServers} className="btn btn-sm">Retry</button>
    </div>
  )}
  ```

- [ ] Task 6.6: Add unit tests for moduleTransform
  - **Output**: Transformation logic tested
  - **Files**: `utils/moduleTransform.test.ts` (new file)
  - **Verify**: All transformation cases covered

  ```typescript
  describe('transformModuleForApi', () => {
    test('extracts latest version correctly');
    test('falls back to first version if no latest tag');
    test('handles supportgame as string');
    test('handles missing supportgame field');
    test('preserves all required module fields');
  });
  ```

- [ ] Task 6.7: Update README with import feature documentation
  - **Output**: Feature documented for users
  - **Files**: `README.md` (if exists) or create project docs
  - **Verify**: Documentation explains import flow and requirements

  ```markdown
  ## Direct Module Import

  Users can import modules directly to Takaro with one click:

  1. Browse to any community module detail page
  2. Click "Import to Takaro" (requires login to Takaro dashboard)
  3. Select target game server from dropdown
  4. Click "Install" to open Takaro installation page

  **Requirements**:

  - User must be logged in to Takaro dashboard in same browser
  - User must have at least one game server configured in Takaro

  **Fallback**: Export JSON button remains available if import fails
  ```

- [ ] Task 6.8: Add console error logging for debugging
  - **Output**: Better debugging in production
  - **Files**: `utils/takaroApi.ts`
  - **Verify**: Errors logged with context
  ```typescript
  // In catch blocks, add detailed logging:
  catch (error: any) {
    console.error('Takaro API Error:', {
      method: 'checkAuthStatus',
      status: error.status,
      message: error.message,
      url: getApiUrl()
    });
    // ... existing error handling
  }
  ```

### Phase 6 Checkpoint

- [ ] Run lint: `npm run lint`
- [ ] Run typecheck: `npm run typecheck`
- [ ] Run unit tests: `npm run test:unit`
- [ ] Run E2E tests: `npm run test:e2e:dev`
- [ ] Manual verification: Test all error scenarios (network failure, validation error, no servers)
- [ ] Manual verification: Test with built-in module, community module, while logged in/out
- [ ] **Demo ready**: Show comprehensive testing suite passing, all edge cases handled

---

## Final Verification

- [ ] All requirements from design doc met (REQ-001 through REQ-010)
- [ ] No obsolete code to remove (pure addition feature per design)
- [ ] All tests pass: unit, component, E2E
- [ ] Lint and typecheck pass with no errors
- [ ] Documentation complete (env vars, feature usage)
- [ ] Manual testing completed:
  - [ ] Authenticated user can import and select server
  - [ ] Unauthenticated user sees disabled button with tooltip
  - [ ] Built-in module shows disabled state
  - [ ] Import errors show toast notifications
  - [ ] Export fallback always available
  - [ ] Modal opens with server list after import
  - [ ] Installation link opens in new tab
- [ ] Performance verified:
  - [ ] Auth check completes <2 seconds
  - [ ] Import completes <5 seconds
  - [ ] UI responsive during async operations
- [ ] Accessibility verified:
  - [ ] Tooltips work with keyboard navigation
  - [ ] Modal can be closed with Escape key
  - [ ] All buttons have aria-labels
  - [ ] Screen reader announces state changes

---

## Notes for Implementation

**Development Setup**:

- Use local Takaro dev instance with `CORS=*` for testing
- Set `NEXT_PUBLIC_TAKARO_API_URL=http://localhost:13000` in `.env.local`

**Common Issues**:

- If auth check fails with CORS error: Verify Takaro API CORS configuration
- If import returns 400: Check module data transformation, log payload
- If modal doesn't open: Verify importedModuleId is set after successful import

**Before Production**:

- Coordinate with backend team to whitelist `community-modules.takaro.io` in CORS
- Set production API URL via environment variable
- Test with production Takaro API
- Monitor error rates via toast notifications

**Testing Strategy**:

- Unit tests: API client methods, data transformation
- Component tests: UI states, button behavior, toast notifications
- E2E tests: Full user journeys, error scenarios
- Manual tests: Real Takaro API integration, cross-browser testing
