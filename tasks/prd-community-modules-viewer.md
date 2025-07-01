# Community Modules Viewer - Technical PRD

## Introduction/Overview

Static web application for browsing Takaro game server modules. Provides documentation, search, and export functionality for built-in and community modules.

## Goals

- Display all available Takaro modules in searchable interface
- Provide complete module documentation (config, commands, hooks, permissions)
- Enable JSON export for direct server import
- Support multiple module versions
- 100% static site - no backend required

## User Stories

### Phase 1: Basic Module Listing
- **As a server admin**, I want to see all available modules, so I can discover what's available
- **As a developer**, I want to browse module code examples, so I can learn module development

### Phase 2: Module Details
- **As a server admin**, I want to view module configuration options, so I can understand setup requirements
- **As a server admin**, I want to see all module commands and permissions, so I can plan user access
- **As a developer**, I want to view implementation code, so I can understand how modules work

### Phase 3: Search & Filter
- **As a server admin**, I want to search modules by name/description, so I can quickly find what I need
- **As a server admin**, I want to filter built-in vs community modules, so I can choose trusted sources

### Phase 4: Export & Version Management
- **As a server admin**, I want to export module JSON, so I can import directly to my server
- **As a server admin**, I want to switch between module versions, so I can use compatible versions

## Functional Requirements

### Phase 1: Basic Module Listing
1. Display all modules in sidebar navigation
2. Show module name and description
3. Categorize as Built-in or Community
4. Auto-redirect to first module on homepage

### Phase 2: Module Details View
5. Display module metadata (name, description, version)
6. Show configuration schema with:
   - Field types and defaults
   - Validation rules
   - UI hints (enum values, min/max)
7. List commands with:
   - Trigger keywords
   - Help text
   - Arguments schema
   - Implementation code (collapsible)
8. Display hooks with:
   - Event types
   - Description
   - Implementation code (collapsible)
9. Show cron jobs with:
   - Schedule expression
   - Description
   - Implementation code (collapsible)
10. List permissions with:
    - Permission key
    - Description
    - Count capability flag

### Phase 3: Search & Filter
11. Real-time search across module names and descriptions
12. Display search result counts
13. Separate counts for Built-in vs Community
14. Persist search state during navigation

### Phase 4: Export & Version Management
15. One-click JSON export with proper formatting
16. Version selector dropdown
17. URL-based version routing (/module/[name]/[version])
18. Auto-redirect to latest version when accessing /module/[name]

## Non-Goals (Out of Scope)

- User authentication/accounts
- Module upload/submission
- Server-side processing
- Module ratings/reviews
- Module dependency management
- Direct server integration

## Technical Considerations

### Tech Stack
- **Framework**: Next.js 15 (App Router, Static Export)
- **UI Library**: DaisyUI + Tailwind CSS
- **Language**: TypeScript
- **Code Highlighting**: PrismJS
- **Markdown**: react-markdown + remark-gfm
- **Icons**: react-icons

### Design System (Takaro-aligned)
- **Theme**: Dark mode matching Takaro dashboard
  - Background: Pure black (#000000)
  - Card backgrounds: Dark gray (#1a1a1a)
  - Text: White primary, gray secondary
- **Colors**:
  - Primary: Purple (#8B5CF6)
  - Secondary: Gray (#6B7280)
  - Success: Green (#10B981)
  - Error: Red (#EF4444)
- **Layout**:
  - Left sidebar navigation (collapsible)
  - Card-based module display
  - Consistent 16px/24px spacing grid
- **Components**:
  - Module cards with rounded corners
  - Version badges
  - Settings menu (three dots)
  - Component count pills
- **Typography**:
  - Sans-serif font stack
  - Clear hierarchy: 2xl for headings, base for body, sm for meta

### Development Environment
```yaml
# docker-compose.yml
services:
  dev:
    image: node:20-alpine
    volumes:
      - .:/app
    working_dir: /app
    ports:
      - "3000:3000"
    command: npm run dev
```

### Project Structure
```
/app
  /module
    /[name]
      /[version]
        page.tsx
      page.tsx
  layout.tsx
  page.tsx
/components
  ModuleSidebar.tsx
  ModuleDetails.tsx
  ConfigSection.tsx
  CommandsSection.tsx
  HooksSection.tsx
  CollapsibleCode.tsx
/utils
  moduleLoader.ts
  searchUtils.ts
/modules
  *.json (community modules)
```

### Data Loading
- **Built-in modules**: Fetch from https://github.com/gettakaro/takaro/tree/main/packages/lib-modules/src/modules
- **Community modules**: Load from `/modules/*.json`
- **Build-time processing**: Generate static pages for all module/version combinations

### State Management
- URL-based routing for module/version selection
- LocalStorage for:
  - Sidebar collapse state
  - Search query persistence
- React hooks for component state

### Testing Strategy
- **Playwright E2E Tests**:
  ```typescript
  test('can search for modules', async ({ page }) => {
    await page.goto('/')
    await page.fill('[data-testid="module-search"]', 'teleport')
    await expect(page.locator('[data-testid="search-results"]')).toContainText('1 result')
  })
  ```
- **Smoke tests** for critical paths:
  - Module listing loads
  - Module details display
  - Search functionality
  - Export button works

### CI/CD Pipeline
```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run lint
      - run: npm run build
      - run: npx playwright install
      - run: npm run test:e2e
```

### Code Quality
- **ESLint**: Standard Next.js config + strict TypeScript
- **Prettier**: Format on save, 2-space indent, single quotes
- **Pre-commit hooks**: Run lint & format

### Performance Requirements
- **Static Generation**: All pages pre-rendered at build time
- **Lazy Loading**: Code syntax highlighting loaded on-demand
- **Bundle Size**: < 200KB initial JS
- **Lighthouse Score**: > 90 for Performance

## Success Metrics

- Page loads < 1 second on 3G connection
- Search results appear < 100ms
- Zero runtime errors in production
- Works on all modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile-responsive on devices > 320px width

## User Flows

### Flow 1: Finding and Viewing a Module
```
1. User lands on homepage → Auto-redirect to first module
2. User sees sidebar with all modules
3. User types in search box → Modules filter in real-time
4. User clicks module name → Module details load
5. User explores commands/config/hooks via collapsible sections
```

### Flow 2: Exporting a Module
```
1. User on module detail page
2. User clicks "Export JSON" button
3. Browser downloads formatted module.json
4. User imports file to Takaro server
```

### Flow 3: Switching Module Versions
```
1. User on module detail page
2. User sees version dropdown in header
3. User selects different version
4. URL updates to /module/[name]/[new-version]
5. Page content updates to show selected version
```

## Development Phases

### Phase 1: Basic Structure (Week 1)
- Next.js setup with TypeScript
- Docker Compose dev environment
- Basic routing structure
- Module data loading from JSON files
- Simple module list display

### Phase 2: Module Details (Week 2)
- Module detail page components
- Collapsible sections
- Code syntax highlighting
- Configuration schema display

### Phase 3: Search & Navigation (Week 3)
- Search functionality
- Sidebar filtering
- URL-based navigation
- Persistent UI state

### Phase 4: Polish & Export (Week 4)
- JSON export feature
- Version management
- Mobile responsive design
- Playwright tests
- GitHub Actions CI/CD

## Open Questions

- Should we cache GitHub API responses during build?
- How often should we rebuild to get latest built-in modules?
- Should module JSON files be validated at build time?