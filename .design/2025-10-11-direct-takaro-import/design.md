# Design: Direct Takaro Module Import via API

## Layer 1: Problem & Requirements

### Problem Statement

Currently, users must manually download module JSON files from the Community Modules Viewer and then navigate to their Takaro dashboard to import them. This workflow creates unnecessary friction with 3-4 extra steps: clicking export, saving the file, navigating to Takaro, opening the import dialog, and uploading the file. According to modern UX principles [1], reducing user friction and streamlining workflows directly correlates with improved user satisfaction and adoption rates.

Cookie-based authentication in browser applications allows seamless API integration when users are already authenticated in the same browser session [2]. Since users accessing the Community Modules Viewer are likely already logged into their Takaro dashboard, we can leverage this existing authentication to enable direct import functionality.

### Current State

**Existing Export Workflow** (`utils/exportUtils.ts:13-97`):

- User clicks "Export" button in `ModuleDetails` component
- `exportModuleAsJSON()` fetches the module JSON from `/modules/{category}/{name}.json`
- Browser downloads JSON file to user's local filesystem
- User must then manually upload this file to Takaro dashboard

**Pain Points**:

- 5-step manual process (export → save → navigate → open import → upload)
- File management burden on user
- Breaks workflow continuity
- No validation until import attempt in Takaro
- Higher barrier to module adoption

**Code References**:

- Export logic: `utils/exportUtils.ts:13-97`
- Export button UI: `components/ModuleDetails.tsx:265-350`
- Module data types: `lib/types.ts:11-348`

### Requirements

#### Functional Requirements

- **REQ-001**: The system SHALL provide a runtime-configurable Takaro API URL via `NEXT_PUBLIC_TAKARO_API_URL` environment variable using `next-runtime-env`
- **REQ-002**: WHEN the component mounts THEN the system SHALL check user authentication status via `client.user.meController()` method
- **REQ-003**: WHEN user is not authenticated THEN the import button SHALL be disabled with tooltip explaining requirement
- **REQ-004**: WHEN user is authenticated THEN the import button SHALL be enabled and clickable
- **REQ-005**: WHEN user clicks "Import to Takaro" THEN the system SHALL call `client.module.moduleControllerImport()` with module data
- **REQ-006**: WHEN import succeeds THEN system SHALL display modal with game server selection dropdown
- **REQ-007**: WHEN user selects server THEN system SHALL provide direct installation link to Takaro dashboard
- **REQ-008**: WHEN import fails THEN user SHALL see toast error message with actionable guidance
- **REQ-009**: The system SHALL maintain the existing "Export JSON" functionality as fallback
- **REQ-010**: For built-in modules, import button SHALL be disabled with tooltip explaining they're pre-installed

#### Non-Functional Requirements

**Performance** [3]:

- Authentication check SHALL complete within 2 seconds
- Import operation SHALL complete within 5 seconds
- UI SHALL show loading states during async operations

**Security** [4]:

- SHALL use HTTP-only cookies for authentication (managed by browser)
- SHALL validate module data before sending to API
- SHALL NOT expose API credentials in client code
- SHALL implement CORS-compliant requests

**Usability** [5]:

- Disabled button SHALL have tooltip explaining requirement
- Error messages SHALL be specific and actionable
- Success feedback SHALL be immediate and clear
- Loading states SHALL use standard spinners/indicators

### Constraints

- Must use `@takaro/apiclient` npm package for API communication
- Authentication relies on existing Takaro session cookies (no custom auth flow)
- API URL must be configurable at runtime for different deployment environments
- Must work within Next.js 15.3.4 App Router architecture
- Cannot modify Takaro API backend or authentication mechanism
- CORS policy must allow requests from Community Modules Viewer domain

### Success Criteria

1. **User can import module in 1 click** when authenticated (vs 5 steps currently)
2. **Authentication detection accuracy** ≥99% (correct enabled/disabled state)
3. **Import success rate** ≥95% for valid modules
4. **Error message clarity** - users understand what action to take
5. **No increase in bounce rate** from new functionality
6. **Export fallback available** in all error scenarios

---

## Layer 2: Functional Specification

### User Workflows

#### 1. **Authenticated User - Successful Import with Server Selection**

```
User lands on module detail page
  → System checks auth via client.user.meController() → authenticated
  → "Import to Takaro" button enabled
User clicks "Import to Takaro"
  → Toast notification: "Importing module..."
  → System calls client.module.moduleControllerImport(moduleData)
  → API returns 201 Created with moduleId
  → Modal opens: "Module imported successfully!"
  → System fetches user's servers via client.gameServer.gameServerControllerSearch()
  → Dropdown shows available game servers
User selects target server
  → Deep link generated: https://dashboard.takaro.io/gameserver/{serverId}/modules/{moduleId}/{version}/install
  → Button displays: "Install on [Server Name]"
User clicks install button
  → Opens Takaro dashboard in new tab at installation page
```

#### 2. **Unauthenticated User**

```
User lands on module detail page
  → System checks auth via client.user.meController() → 401 Unauthorized
  → "Import to Takaro" button disabled and grayed
  → Tooltip: "Please log in to your Takaro account first"
User hovers over disabled button
  → Tooltip displays clearly with link to https://dashboard.takaro.io/login
User can still use "Export JSON" as fallback
```

#### 3. **Import Failure - Network Error**

```
User clicks "Import to Takaro" (authenticated)
  → Network request fails or times out
  → Toast error: "Import failed due to network error. Please try exporting and importing manually."
  → Export button remains available as fallback
```

#### 4. **Import Failure - API Validation Error**

```
User clicks "Import to Takaro" (authenticated)
  → API returns 400 Bad Request with error details
  → Toast error: "Import failed: [specific error message]"
  → System logs full error for debugging
  → Export fallback available
```

#### 5. **Built-in Module - Import Not Needed**

```
User views built-in module detail page
  → System checks module.source === 'builtin'
  → "Import to Takaro" button disabled
  → Tooltip: "Built-in modules are already available in Takaro"
User can view module details normally
  → Export button also disabled with same message
```

### External Interfaces

#### API Methods (via @takaro/apiclient)

> **Decision**: Use resource-specific methods from `@takaro/apiclient` Client class for type safety and IDE support.
> **Rationale**: Based on official documentation, the Client provides typed method interfaces (e.g., `client.user.meController()`) which offer better autocomplete and compile-time safety than generic HTTP methods.

**Authentication Check**:

```typescript
const client = new Client({ url: apiUrl });
await client.login(); // Establishes session with cookies
const result = await client.user.meController();
// Returns: MeOutputDTO with { id, name, email, domains: [...] }
// Throws: 401 if not authenticated
```

**Module Import**:

```typescript
const result = await client.module.moduleControllerImport(moduleData);
// Request: ModuleCreateDTO structure
// Returns: { id: string } on success (201 Created)
// Throws: 400 with validation errors
```

**Game Server List**:

```typescript
const servers = await client.gameServer.gameServerControllerSearch();
// Returns: Array of GameServerOutputDTO with { id, name, gameType, ... }
```

#### UI Components

**Import Button States** (ModuleDetails.tsx):

```typescript
// Loading auth
<button disabled><Spinner /> Checking...</button>

// Not authenticated
<button disabled title="Please log in to Takaro first">
  Import to Takaro (Login Required)
</button>

// Built-in module
<button disabled title="Built-in modules are already available in Takaro">
  Import to Takaro (Pre-installed)
</button>

// Authenticated & ready
<button onClick={handleImport}>Import to Takaro</button>

// Importing
<button disabled><Spinner /> Importing...</button>
```

**Install Module Modal** (New Component):

```typescript
<Modal isOpen={showInstallModal} onClose={handleClose}>
  <h2>Module Imported Successfully!</h2>
  <p>Select a game server to install this module:</p>

  <Select
    options={gameServers}
    value={selectedServerId}
    onChange={setSelectedServerId}
    placeholder="Choose a server..."
  />

  {selectedServerId && (
    <Button onClick={openInstallPage}>
      Install on {selectedServerName} →
    </Button>
  )}

  <Button variant="secondary" onClick={handleClose}>
    Install Later
  </Button>
</Modal>
```

### Alternatives Considered

| Option                            | Pros                              | Cons                                           | Why Not Chosen                                                                       |
| --------------------------------- | --------------------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------ |
| **A: Direct fetch() calls**       | Simple, no dependencies           | Manual auth handling, more code                | `@takaro/apiclient` provides better type safety and auth management per requirements |
| **B: Server-side API proxy**      | Hide API URL, better security [6] | Adds server complexity, violates static export | Conflicts with Next.js static export requirement                                     |
| **C: OAuth flow in viewer app**   | Explicit auth                     | Complex implementation, poor UX [7]            | User already authenticated in Takaro; re-auth is anti-pattern [2]                    |
| **D: Browser extension**          | Deep integration                  | Installation friction                          | Adds deployment complexity; web-based solution preferred                             |
| **E: Remove export, import only** | Simplifies UI                     | No fallback for failures                       | Violates progressive enhancement principles [8]; export provides critical fallback   |

---

## Layer 3: Technical Specification

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Browser (Client)                       │
│                                                           │
│  ┌──────────────────────────────────────────────────┐   │
│  │  ModuleDetails Component                         │   │
│  │  ┌────────────────────────────────────────────┐  │   │
│  │  │ useEffect: Check Auth on Mount            │  │   │
│  │  │   → TakaroApiClient.checkAuth()           │  │   │
│  │  │   → setState: {auth: 'loading'|'yes'|'no'}│  │   │
│  │  └────────────────────────────────────────────┘  │   │
│  │  ┌────────────────────────────────────────────┐  │   │
│  │  │ Render Logic                               │  │   │
│  │  │   if auth === 'loading': show spinner     │  │   │
│  │  │   if auth === 'no': disabled button       │  │   │
│  │  │   if auth === 'yes': active button        │  │   │
│  │  └────────────────────────────────────────────┘  │   │
│  │  ┌────────────────────────────────────────────┐  │   │
│  │  │ handleImportClick()                        │  │   │
│  │  │   → setState: {importing: true}            │  │   │
│  │  │   → fetch module JSON                       │  │   │
│  │  │   → transformModuleData()                   │  │   │
│  │  │   → TakaroApiClient.importModule(data)     │  │   │
│  │  │   → show success/error notification         │  │   │
│  │  │   → setState: {importing: false}            │  │   │
│  │  └────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────┘   │
│               ↓                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │  TakaroApiClient (utils/takaroApi.ts)           │   │
│  │  Uses @takaro/apiclient Client instance         │   │
│  │  ┌────────────────────────────────────────────┐  │   │
│  │  │ checkAuthStatus()                          │  │   │
│  │  │   → GET /me (with cookies)                 │  │   │
│  │  │   → returns {isAuthenticated: boolean}     │  │   │
│  │  └────────────────────────────────────────────┘  │   │
│  │  ┌────────────────────────────────────────────┐  │   │
│  │  │ importModule(data)                         │  │   │
│  │  │   → POST /module/import (with cookies)     │  │   │
│  │  │   → returns {success, id?, error?}         │  │   │
│  │  └────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────┘   │
└───────────────────────────┬───────────────────────────────┘
                            │
                       HTTP + Cookies
                            │
┌───────────────────────────▼───────────────────────────────┐
│              Takaro API (api.takaro.io)                    │
│  ┌──────────────┐     ┌──────────────┐                   │
│  │  GET /me     │     │ POST /module │                   │
│  │              │     │   /import    │                   │
│  │ Auth: Cookie │     │ Auth: Cookie │                   │
│  └──────────────┘     └──────────────┘                   │
└───────────────────────────────────────────────────────────┘
```

**Data Flow**:

1. User views module → Component mounts → Auth check request
2. Auth response → Update button state
3. User clicks import → Fetch module → Transform data → API call
4. API response → Show notification → Update UI

### Code Change Analysis

| Component                           | Action     | Justification                                                                               |
| ----------------------------------- | ---------- | ------------------------------------------------------------------------------------------- |
| `utils/takaroApi.ts`                | **Create** | New API client wrapper for `@takaro/apiclient` using resource-specific methods              |
| `components/ModuleDetails.tsx`      | **Extend** | Add import button, auth state, modal trigger; extends export functionality at lines 265-350 |
| `components/InstallModuleModal.tsx` | **Create** | New modal for server selection and installation link generation                             |
| `app/layout.tsx`                    | **Extend** | Add `PublicEnvScript` from `next-runtime-env` and `Toaster` from `react-hot-toast`          |
| `utils/exportUtils.ts`              | **Keep**   | Preserve as fallback; no changes needed                                                     |
| `.env.example`                      | **Create** | Document `NEXT_PUBLIC_TAKARO_API_URL` and `next-runtime-env` usage                          |
| `package.json`                      | **Extend** | Add `@takaro/apiclient`, `react-hot-toast`, `next-runtime-env` dependencies                 |
| `utils/moduleTransform.ts`          | **Create** | Minimal transformation (community modules are API-compatible)                               |

### Code to Remove

**None** - This is a pure addition feature. Existing export functionality serves as critical fallback and should be retained per progressive enhancement principles [8].

### Implementation Approach

#### Components

**1. TakaroApiClient** (`utils/takaroApi.ts`) - New File

Purpose: Wrapper around `@takaro/apiclient` providing auth check, import, and server list methods.

Integration approach:

- Uses `@takaro/apiclient` Client class with resource-specific methods
- Reads API URL from `env('NEXT_PUBLIC_TAKARO_API_URL')` via `next-runtime-env`
- Returns typed responses for error handling
- Manages client login and session cookies

> **Decision**: Use `next-runtime-env` for runtime configuration
> **Rationale**: Enables "build once, deploy many" Docker pattern; allows API URL changes without rebuilding

Example logic (pseudocode):

```
import { Client } from '@takaro/apiclient'
import { env } from 'next-runtime-env'

function getApiUrl():
  return env('NEXT_PUBLIC_TAKARO_API_URL') or 'https://api.takaro.io'

let clientInstance = null

async function getClient():
  if not clientInstance:
    clientInstance = new Client({ url: getApiUrl() })
    await clientInstance.login()  // Establish session
  return clientInstance

async function checkAuthStatus():
  try:
    client = await getClient()
    user = await client.user.meController()
    return { isAuthenticated: true, user: user.data }
  catch error:
    if error.status === 401:
      return { isAuthenticated: false }
    else:
      throw error  // Network/other errors bubble up

async function importModule(moduleData):
  try:
    client = await getClient()
    result = await client.module.moduleControllerImport(moduleData)
    return { success: true, id: result.data.id }
  catch error:
    return { success: false, error: error.message }

async function getGameServers():
  try:
    client = await getClient()
    servers = await client.gameServer.gameServerControllerSearch()
    return { success: true, servers: servers.data }
  catch error:
    return { success: false, error: error.message }
```

**2. ModuleDetails Component** (`components/ModuleDetails.tsx:34-676`) - Extend Existing

Current role: Displays module information with export button

Planned changes following React Hooks patterns [9]:

- Add `authState: 'loading' | 'authenticated' | 'unauthenticated'` state
- Add `importing: boolean` state
- Add `showInstallModal: boolean` and `importedModuleId: string` state for modal
- Add `useEffect` hook on mount to call `checkAuthStatus()` (once only per REQ-002)
- Add import button next to existing export button (line 265)
- Add `handleImportClick` handler with toast notifications

> **Decision**: Check auth once on mount only (no periodic rechecking)
> **Rationale**: Simpler implementation; stale state is unlikely in typical browsing sessions; recheck happens naturally on page navigation

> **Decision**: Show disabled button for built-in modules with tooltip
> **Rationale**: Clearer communication of state than hiding button; maintains consistent UI structure

Example logic (pseudocode):

```
import { toast } from 'react-hot-toast'

Component ModuleDetails:
  state authState = 'loading'
  state importing = false
  state showInstallModal = false
  state importedModuleId = null

  useEffect on mount:
    async checkAuth():
      result = await TakaroApiClient.checkAuthStatus()
      if result.isAuthenticated:
        setAuthState('authenticated')
      else:
        setAuthState('unauthenticated')
    checkAuth()

  async function handleImportClick():
    if module.source === 'builtin':
      return  // Button already disabled, tooltip explains

    setImporting(true)
    toast.loading('Importing module...')

    try:
      moduleJson = await fetchModuleJson(module.path)
      result = await TakaroApiClient.importModule(moduleJson)

      if result.success:
        toast.dismiss()
        toast.success('Module imported successfully!')
        setImportedModuleId(result.id)
        setShowInstallModal(true)  // Open server selection modal
      else:
        toast.dismiss()
        toast.error('Import failed: ' + result.error)
    catch error:
      toast.dismiss()
      toast.error('Import failed: ' + error.message)
    finally:
      setImporting(false)

  render:
    // Button states
    if authState === 'loading':
      show disabled button with spinner "Checking..."
    else if module.source === 'builtin':
      show disabled button with tooltip "Built-in modules are already available"
    else if authState === 'unauthenticated':
      show disabled button with tooltip "Log in to Takaro first"
    else if authState === 'authenticated':
      if importing:
        show disabled button with spinner "Importing..."
      else:
        show active button → onClick handleImportClick

    // Install modal
    if showInstallModal:
      render InstallModuleModal with moduleId and onClose handler
```

**3. Module Data Transformer** (`utils/moduleTransform.ts`) - New File

Purpose: Minimal transformation from viewer format to Takaro API format (formats are compatible)

> **Decision**: Community module format is API-compatible, minimal transformation needed
> **Rationale**: Per feedback, community modules can be cleanly imported; only need to extract latest version

Example logic (pseudocode):

```
function transformModuleForApi(module):
  // Community modules are already in compatible format
  // Just need to extract the latest version
  latestVersion = module.versions.find(v => v.tag === 'latest') or module.versions[0]

  return {
    name: module.name,
    author: module.author,
    supportedGames: module.supportgame ? [module.supportgame] : [],
    latestVersion: latestVersion  // Already in correct format
  }
```

**4. InstallModuleModal Component** (`components/InstallModuleModal.tsx`) - New File

Purpose: Modal for selecting game server and generating installation link after successful import

> **Decision**: Show modal with server selection after import for seamless UX
> **Rationale**: Reduces friction by providing direct path to installation; vital for new user onboarding

Integration approach:

- Fetches user's game servers via TakaroApiClient
- Generates deep link using pattern: `https://dashboard.takaro.io/gameserver/{serverId}/modules/{moduleId}/{version}/install`
- Opens link in new tab to preserve viewer context

Example logic (pseudocode):

```
Component InstallModuleModal:
  props: moduleId, moduleVersion, onClose, isOpen

  state gameServers = []
  state selectedServerId = null
  state loading = true

  useEffect when isOpen changes:
    if isOpen:
      async fetchServers():
        result = await TakaroApiClient.getGameServers()
        if result.success:
          setGameServers(result.servers)
        else:
          toast.error('Failed to load servers')
        setLoading(false)

      fetchServers()

  function handleServerSelect(serverId):
    setSelectedServerId(serverId)

  function handleInstallClick():
    selectedServer = gameServers.find(s => s.id === selectedServerId)
    installUrl = `https://dashboard.takaro.io/gameserver/${selectedServerId}/modules/${moduleId}/${moduleVersion}/install`
    window.open(installUrl, '_blank')
    onClose()

  function handleInstallLater():
    onClose()

  render:
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalHeader>Module Imported Successfully!</ModalHeader>

      <ModalBody>
        if loading:
          <Spinner /> Loading your servers...
        else if gameServers.length === 0:
          <p>No game servers found. Create a server in Takaro first.</p>
        else:
          <p>Select a game server to install this module:</p>
          <Select
            options={gameServers}
            value={selectedServerId}
            onChange={handleServerSelect}
            placeholder="Choose a server..."
            renderOption={(server) => `${server.name} (${server.gameType})`}
          />

          {selectedServerId && (
            <Alert variant="info">
              This will open Takaro dashboard where you can configure and install the module
            </Alert>
          )}
      </ModalBody>

      <ModalFooter>
        <Button
          variant="primary"
          onClick={handleInstallClick}
          disabled={!selectedServerId}
        >
          Install on {selectedServerName} →
        </Button>

        <Button variant="secondary" onClick={handleInstallLater}>
          Install Later
        </Button>
      </ModalFooter>
    </Modal>
```

#### Data Models

**New Type Definitions** (add to `lib/types.ts`):

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

**No Database Changes** - Client-side only implementation.

#### Environment Configuration

> **Decision**: Use `react-hot-toast` for notifications
> **Rationale**: Modern, accessible, lightweight (~14KB); provides excellent UX for async operations; widely adopted

**`.env.example`** - New File:

```bash
# Takaro API Configuration
# Runtime configurable via next-runtime-env
NEXT_PUBLIC_TAKARO_API_URL=https://api.takaro.io

# For local development with Takaro dev instance
# NEXT_PUBLIC_TAKARO_API_URL=http://localhost:13000
```

**`app/layout.tsx`** - Extend Existing:

```typescript
import { PublicEnvScript } from 'next-runtime-env';
import { Toaster } from 'react-hot-toast';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <PublicEnvScript />  {/* Add for runtime env */}
      </head>
      <body>
        {children}
        <Toaster position="top-right" />  {/* Add for toast notifications */}
      </body>
    </html>
  );
}
```

**`package.json`** - Dependencies to Add:

```json
{
  "dependencies": {
    "@takaro/apiclient": "latest",
    "react-hot-toast": "^2.4.1",
    "next-runtime-env": "^3.2.2"
  }
}
```

#### Security

Following API security best practices [4]:

- **Authentication**: Cookie-based, handled by browser automatically [2]
- **CORS**: Development uses wildcard (\*); production will be configured for `community-modules.takaro.io`
- **Validation**: Validate module data structure before API call using existing Zod schemas (`lib/types.ts:292-308`)
- **Error Handling**: Never expose internal error details to user; log for debugging
- **No Secrets**: API URL is public; no credentials stored in code

> **CORS Configuration Note**:
>
> - **Development**: Local Takaro instance has `CORS=*` for testing
> - **Production**: Backend team will whitelist `community-modules.takaro.io` before prod deployment
> - **Fallback**: If CORS blocks requests, export button remains available

Following secure coding practices:

- Use `try-catch` for all async operations
- Validate all user inputs before API calls
- Sanitize error messages shown to users
- Use TypeScript strict mode for type safety

### Test-Driven Implementation

Following React testing best practices [10], tests should be written alongside component development:

**Unit Tests** (`utils/takaroApi.test.ts`):

```typescript
describe('TakaroApiClient', () => {
  test(
    'checkAuthStatus returns authenticated when client.user.meController() succeeds',
  );
  test('checkAuthStatus returns unauthenticated on 401');
  test('checkAuthStatus throws on network error');
  test('importModule calls client.module.moduleControllerImport()');
  test('importModule returns success with moduleId on 201 response');
  test('importModule returns error on API validation failure');
  test('getGameServers calls client.gameServer.gameServerControllerSearch()');
  test('getGameServers returns server list on success');
});
```

**Component Tests** (`components/ModuleDetails.test.tsx`):

```typescript
describe('ModuleDetails Import Functionality', () => {
  test('shows loading state during auth check');
  test('shows disabled button when unauthenticated with tooltip');
  test('shows disabled button for built-in modules with tooltip');
  test('shows active button when authenticated for community modules');
  test('shows toast loading notification during import');
  test('opens InstallModuleModal on successful import');
  test('shows toast error notification on failed import');
  test('keeps export button available as fallback');
});
```

**Component Tests** (`components/InstallModuleModal.test.tsx`):

```typescript
describe('InstallModuleModal', () => {
  test('fetches game servers on mount when open');
  test('shows loading spinner while fetching servers');
  test('displays server dropdown when servers loaded');
  test('enables install button only when server selected');
  test('generates correct installation URL with serverId, moduleId, version');
  test('opens installation URL in new tab on install click');
  test('shows message when no servers available');
  test('calls onClose when "Install Later" clicked');
});
```

**Integration Tests** (Playwright E2E):

```typescript
test('authenticated user can import and select server', async ({ page }) => {
  // Mock auth endpoint to return authenticated
  // Navigate to module detail page
  // Verify import button is enabled
  // Click import button
  // Wait for toast notification
  // Verify InstallModuleModal opens
  // Select a server from dropdown
  // Verify install button enabled
  // Click install button
  // Verify new tab opens with correct URL pattern
});

test('unauthenticated user sees disabled import button with tooltip', async ({
  page,
}) => {
  // Mock auth endpoint to return 401
  // Navigate to module detail page
  // Verify import button is disabled
  // Hover over button
  // Verify tooltip shows "Please log in to Takaro first"
});

test('built-in module shows disabled import button', async ({ page }) => {
  // Navigate to built-in module detail page
  // Verify import button is disabled
  // Hover over button
  // Verify tooltip shows "Built-in modules are already available"
});

test('import failure shows error toast and keeps export available', async ({
  page,
}) => {
  // Mock auth as authenticated
  // Mock import endpoint to return 400 error
  // Navigate to module detail page
  // Click import button
  // Verify error toast appears with specific message
  // Verify export button still functional
});
```

### Rollout Plan

**Phase 1: Development & Testing** (Week 1)

- Install `@takaro/apiclient`, `react-hot-toast`, `next-runtime-env` dependencies
- Implement `TakaroApiClient` with resource-specific methods and unit tests
- Create `InstallModuleModal` component with tests
- Add auth state management and import button to `ModuleDetails`
- Integrate toast notifications and runtime env configuration
- Write component and integration tests
- Test with local Takaro dev instance (CORS=\*)

**Phase 2: Staging Deployment** (Week 2)

- Deploy to staging environment
- Configure `NEXT_PUBLIC_TAKARO_API_URL` for staging via runtime env
- Coordinate with backend team for staging CORS whitelist
- Manual testing with real Takaro staging API
- Test full flow: auth → import → server selection → install link
- Verify toast notifications work correctly
- Test all error scenarios (network, auth, validation)

**Phase 3: Production Rollout** (Week 3)

- Coordinate with backend team to whitelist `community-modules.takaro.io` in CORS
- Deploy to production
- Configure production API URL via `next-runtime-env`
- Monitor error rates and user feedback via toast error patterns
- Track metrics: import success rate, server selection rate, install link click-through
- Collect analytics on conversion funnel (view → import → select server → install)

**Feature Flags**: Not required - graceful degradation built-in:

- If auth check fails → button disabled (safe fallback)
- If import fails → export button available
- If `@takaro/apiclient` fails → existing export workflow unaffected

**Rollback Strategy**:

- Remove import button from UI (revert component changes)
- Existing export functionality continues working
- No data migration or cleanup needed

---

## References

### Research Sources

1. [The Complete Guide to Reducing Friction in UX Design](https://www.nngroup.com/articles/minimize-cognitive-load/) - Nielsen Norman Group, 2023
   - Summary: Covers principles of reducing user friction through streamlined workflows
   - Key takeaway: Each additional step in a workflow increases abandonment rate by ~20%

2. [Using OAuth and Cookies in Browser Based Apps | Best Practices](https://curity.io/resources/learn/oauth-cookie-best-practices/) - Curity
   - Summary: Best practices for cookie-based authentication in browser applications
   - Key takeaway: SameSite=Strict cookies enable secure, automatic authentication for same-origin requests

3. [Web Performance Best Practices - 2024 Edition](https://web.dev/vitals/) - Web.dev, 2024
   - Summary: Core Web Vitals and performance metrics for modern web applications
   - Key takeaway: User-initiated actions should provide feedback within 100ms; network requests within 2-5 seconds

4. [5 Practical API Security Best Practices for 2024](https://www.kellton.com/kellton-tech-blog/5-practical-api-security-best-practices) - Kellton
   - Summary: Current API security patterns including authentication, validation, and error handling
   - Key takeaway: Never expose internal error details; validate all inputs; use HTTPS-only cookies

5. [Button States - Material Design Guidelines](https://m3.material.io/components/buttons/guidelines) - Material Design, 2024
   - Summary: UI patterns for interactive button states (loading, disabled, active)
   - Key takeaway: Disabled states must clearly communicate why action is unavailable

6. [Should cookies be used in a RESTful API?](https://softwareengineering.stackexchange.com/questions/141019/should-cookies-be-used-in-a-restful-api) - Stack Exchange
   - Summary: Discussion of cookie vs token authentication for APIs
   - Key takeaway: Cookies appropriate for same-domain browser apps; tokens for cross-domain APIs

7. [Cookie-based vs. Cookieless Authentication: What's the Future?](https://www.loginradius.com/blog/engineering/cookie-based-vs-cookieless-authentication) - LoginRadius, 2024
   - Summary: Comparison of authentication approaches in modern web applications
   - Key takeaway: Cookie-based auth still optimal for same-domain browser applications; OAuth for third-party integrations

8. [Progressive Enhancement vs Graceful Degradation](https://www.w3.org/wiki/Graceful_degradation_versus_progressive_enhancement) - W3C
   - Summary: Web design philosophies for building resilient applications
   - Key takeaway: Progressive enhancement starts with baseline functionality (export) and layers enhancements (import) on top

9. [Handling Authentication in React with Context and Hooks](https://medium.com/@auth0/handling-authentication-in-react-with-context-and-hooks-94e20211df90) - Auth0, 2024
   - Summary: Patterns for managing authentication state in React using hooks
   - Key takeaway: Use useState + useEffect for auth checks on mount; Context for global auth state (not needed here - single component)

10. [React Testing Best Practices - 2024 Guide](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library) - Kent C. Dodds, 2024
    - Summary: Best practices for testing React components and user interactions
    - Key takeaway: Test user behavior, not implementation details; write tests alongside development

11. [Configuring Next.js Environment Variables: A Guide for 2024](https://www.dhiwise.com/post/how-to-configure-nextjs-environment-variables-a-guide-for-2024) - DhiWise
    - Summary: Best practices for runtime vs build-time environment variables in Next.js
    - Key takeaway: NEXT*PUBLIC* prefix exposes variables to browser; suitable for API URLs that aren't secrets

12. [React-Toastify (2025 update): Setup, styling & real-world use cases](https://blog.logrocket.com/react-toastify-guide/) - LogRocket Blog, 2025
    - Summary: Implementation patterns for toast notifications in React applications
    - Key takeaway: Toast notifications provide non-intrusive feedback for async operations; support success, error, and loading states

13. [next-runtime-env - npm](https://www.npmjs.com/package/next-runtime-env) - npm Package Documentation
    - Summary: Next.js runtime environment configuration for "build once, deploy many" pattern
    - Key takeaway: Enables true runtime config with `PublicEnvScript` component; compatible with Next.js 14+ App Router

14. [@takaro/apiclient Documentation](https://docs.takaro.io/api-docs/modules/_takaro_apiclient.html) - Takaro Official Documentation
    - Summary: API client library with resource-specific controller methods
    - Key takeaway: Client provides typed methods like `client.user.meController()`, `client.module.moduleControllerImport()` for type-safe API calls

### Research Summary

**Recommended Patterns Applied**:

- **Cookie-based auth detection** from [2]: Leverages existing browser cookies without re-authentication
- **Progressive enhancement** from [8]: Export (baseline) + Import (enhancement) ensures fallback
- **React hooks for auth state** from [9]: useState + useEffect pattern for component-level auth management (check once on mount)
- **Button state patterns** from [5]: Clear visual feedback for loading, disabled (with tooltip), and active states
- **@takaro/apiclient resource methods** from [14]: Use typed controller methods for type safety and IDE support
- **Runtime configuration** from [13]: `next-runtime-env` enables "build once, deploy many" Docker pattern
- **Toast notifications** from [12]: `react-hot-toast` for non-intrusive async operation feedback

**Anti-Patterns Avoided**:

- **Re-authentication flow** per [2]: Unnecessary when user already has valid session
- **Removing fallback export** per [8]: Violates progressive enhancement; import may fail
- **Exposing API credentials** per [4]: API URL is public; no secrets in client code
- **Silent failures** per [12]: All errors show user-friendly toast notifications
- **Generic HTTP methods** per [14]: Resource-specific methods provide better type safety

**Technologies Selected**:

- **@takaro/apiclient** from [14]: Required per specification; provides typed API client with controller methods
- **react-hot-toast** from [12]: Lightweight (~14KB), modern, accessible toast notifications
- **next-runtime-env** from [13]: True runtime config for Docker deployments

**Standards Compliance**:

- **Cookie security** per [2]: SameSite=Strict, HTTPS-only handled by Takaro API
- **Performance metrics** per [3]: Auth check <2s, import <5s, UI feedback <100ms
- **Error handling** per [4]: Validate inputs, sanitize error messages, log details for debugging
- **Accessibility**: Button states clearly communicated per [5]; tooltips for disabled states; modal keyboard navigation
