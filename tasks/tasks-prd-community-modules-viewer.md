## Tasks

- [x] 1.0 Set up project foundation and development environment
  - [x] 1.1 Initialize Next.js 15 project with TypeScript and App Router
  - [x] 1.2 Configure Tailwind CSS with DaisyUI and custom Takaro theme colors
  - [x] 1.3 Set up Docker Compose development environment
  - [x] 1.4 Configure ESLint and Prettier with project standards
  - [x] 1.5 Create basic project folder structure as per PRD
  - [x] 1.6 Set up TypeScript interfaces in lib/types.ts for module data structures

- [x] 2.0 Implement module data loading and processing system
  - [x] 2.1 [depends on: 1.6] Create moduleLoader utility for reading local JSON files
  - [x] 2.2 [depends on: 1.6] Implement GitHub API client for fetching built-in modules
  - [x] 2.3 [depends on: 2.1, 2.2] Create module data aggregation and normalization logic
  - [x] 2.4 [depends on: 2.3] Implement static page generation for all module/version combinations
  - [x] 2.5 [depends on: 2.1] Add module data validation and error handling

- [x] 3.0 Build core UI components with Takaro design system
  - [x] 3.1 [depends on: 1.2] Create root layout with dark theme and global styles
  - [x] 3.2 [depends on: 3.1] Build ModuleCard component with Takaro styling
  - [x] 3.3 [depends on: 3.1] Implement CollapsibleCode component with PrismJS integration
  - [x] 3.4 [depends on: 1.6] Create section components (Config, Commands, Hooks, CronJobs, Permissions)
  - [x] 3.5 [depends on: 3.2, 3.4] Build ModuleDetails main component

- [x] 4.0 Create module browsing and navigation features
  - [x] 4.1 [depends on: 2.3, 3.2] Build ModuleSidebar with module listing
  - [x] 4.2 [depends on: 4.1] Implement sidebar collapse/expand functionality with LocalStorage
  - [x] 4.3 [depends on: 2.4] Create dynamic routing pages for modules
  - [x] 4.4 [depends on: 4.3] Implement auto-redirect logic for homepage and version routes
  - [x] 4.5 [depends on: 3.5, 4.3] Connect module detail pages with ModuleDetails component

- [x] 5.0 Implement search, filtering, and export functionality
  - [x] 5.1 [depends on: 4.1] Add search input to ModuleSidebar
  - [x] 5.2 [depends on: 5.1] Create searchUtils for real-time filtering
  - [x] 5.3 [depends on: 5.2] Implement search result counts display
  - [x] 5.4 [depends on: 5.1] Add LocalStorage persistence for search state
  - [x] 5.5 [depends on: 3.5] Implement JSON export functionality with download
  - [x] 5.6 [depends on: 4.5] Add version selector dropdown to module details

- [x] 6.0 Add testing, CI/CD, and production optimization
  - [x] 6.1 [depends on: 3.0] Write unit tests for all components
  - [x] 6.2 [depends on: 2.0] Write unit tests for utility functions
  - [x] 6.3 [depends on: 5.0] Create Playwright E2E tests for critical user flows
  - [x] 6.4 [depends on: 1.0] Set up GitHub Actions CI/CD pipeline
  - [x] 6.5 [depends on: 4.0, 5.0] Implement lazy loading for code highlighting
  - [x] 6.6 [depends on: 6.3] Add mobile responsive design and test on various devices

- [ ] 7.0 Comprehensive E2E Testing Suite
  - [x] 7.1 [depends on: 6.6] Mobile responsiveness E2E tests - hamburger menu interactions, mobile navigation, responsive layouts
  - [x] 7.2 [depends on: 5.0] Source filtering E2E tests - Community/Built-in filter functionality and filter combinations
  - [x] 7.3 [depends on: 4.0] Navigation edge cases E2E tests - auto-redirects, 404 handling, URL validation
  - [ ] 7.4 [depends on: 3.0] All section types E2E tests - config, commands, hooks, cron jobs, functions, permissions sections
  - [ ] 7.5 [depends on: 7.4] Section interactions E2E tests - collapse/expand, Pretty/Raw toggle for each section type
  - [ ] 7.6 [depends on: 7.4] Empty state handling E2E tests - modules with missing sections, empty data scenarios
  - [ ] 7.7 [depends on: 5.0] State persistence E2E tests - localStorage for search/filter/sidebar state across sessions
  - [ ] 7.8 [depends on: 4.0] Cross-module navigation E2E tests - browsing between modules while maintaining state
  - [ ] 7.9 [depends on: 5.6] Version management E2E tests - switching versions within module, URL updates
  - [ ] 7.10 [depends on: 5.5] Export workflows E2E tests - current version vs all versions export validation
  - [ ] 7.11 [depends on: 6.6] Multi-device E2E tests - tablet breakpoints, various mobile screen sizes
  - [ ] 7.12 [depends on: 6.5] Performance E2E tests - lazy loading verification, large module handling
  - [ ] 7.13 [depends on: 2.0] Error scenarios E2E tests - network failures, malformed data, missing assets

## Relevant Files

- `app/layout.tsx` - Root layout with Takaro-aligned dark theme, metadata, and viewport configuration (updated)
- `app/page.tsx` - Homepage with module statistics and sidebar integration (updated)
- `app/module/[name]/page.tsx` - Module detail page with version redirect (created)
- `app/module/[name]/[version]/page.tsx` - Module version detail page (created)
- `package.json` - Updated with Next.js 15, React, TypeScript, Zod, and PrismJS dependencies
- `tsconfig.json` - TypeScript configuration for Next.js
- `next.config.js` - Next.js configuration with static export settings
- `.gitignore` - Already existed with proper Next.js entries
- `tailwind.config.js` - Tailwind configuration with DaisyUI and Takaro theme colors (created)
- `postcss.config.js` - PostCSS configuration for Tailwind CSS (created)
- `app/globals.css` - Comprehensive dark theme global styles with Takaro design system, component classes, animations, and mobile-responsive breakpoints (updated)
- `Dockerfile` - Development Docker configuration (created)
- `docker-compose.yml` - Docker Compose development environment configuration (created)
- `Dockerfile.prod` - Production Docker configuration (created)
- `docker-compose.prod.yml` - Docker Compose production configuration (created)
- `.dockerignore` - Docker ignore file (created)
- `DOCKER.md` - Docker usage documentation (created)
- `.eslintrc.json` - ESLint configuration with TypeScript and Prettier integration (created)
- `.prettierrc` - Prettier configuration for code formatting (created)
- `.prettierignore` - Prettier ignore patterns (created)
- `PROJECT_STRUCTURE.md` - Documentation of project directory layout (created)
- `components/` - Directory for React components (created)
- `utils/` - Directory for utility functions (created)
- `lib/` - Directory for library code and types (created)
- `tests/e2e/` - Directory for Playwright E2E tests (created)
- `components/ModuleSidebar.tsx` - Collapsible sidebar with module list, search, filtering, navigation functionality, and mobile-responsive hamburger menu system (updated)
- `app/module/layout.tsx` - Two-column layout component integrating sidebar with module content pages and mobile responsiveness (updated)
- `components/MobileLayoutWrapper.tsx` - Client-side wrapper component for mobile menu state management and responsive layout control (created)
- `components/ModuleDetails.tsx` - Main module details display component with version management, section integration, export functionality, and mobile-responsive layout optimizations (updated)
- `components/ModuleDetails.test.tsx` - Unit tests for module details
- `components/ModuleCard.tsx` - Reusable card component for displaying module information with Takaro styling (created)
- `components/ConfigSection.tsx` - Configuration schema display component with JSON/UI schema parsing and display (created)
- `components/CommandsSection.tsx` - Commands list with collapsible code, arguments, and usage examples (created)
- `components/HooksSection.tsx` - Hooks display with implementation code, event types, and regex patterns (created)
- `components/CronJobsSection.tsx` - Cron jobs section component with human-readable schedule explanations (created)
- `components/PermissionsSection.tsx` - Permissions display component with grouping and count capabilities (created)
- `components/CollapsibleCode.tsx` - Reusable code viewer with PrismJS syntax highlighting, expand/collapse functionality, lazy loading optimization, and mobile-responsive layout (updated)
- `utils/moduleLoader.ts` - Module data fetching and processing utilities with aggregation logic and Zod validation (updated)
- `utils/moduleLoader.test.ts` - Unit tests for module loader
- `utils/searchUtils.ts` - Search and filter utility functions
- `utils/searchUtils.test.ts` - Unit tests for search utilities
- `utils/exportUtils.ts` - Module export functionality for JSON download and clipboard copying (created)
- `lib/github.ts` - GitHub API client for fetching built-in modules with Zod validation (updated)
- `lib/types.ts` - TypeScript interfaces and Zod validation schemas for module data structures (updated with validation)
- `tailwind.config.js` - Tailwind configuration with Takaro theme colors
- `docker-compose.yml` - Docker development environment configuration
- `playwright.config.js` - Playwright test configuration for smoke tests (created)
- `playwright.config.prod.js` - Playwright configuration for production testing (created)
- `tests/e2e/modules.spec.ts` - Playwright E2E smoke tests for core user flows (created)
- `scripts/test-e2e.sh` - Shell script for automated production testing workflow (created)
- `nginx.conf` - Nginx configuration for production static file serving (created)
- `.github/workflows/ci.yml` - GitHub Actions CI/CD pipeline configuration with quality checks and E2E tests (created)
- `jest.config.js` - Jest configuration with Next.js integration and path mapping (created)
- `jest.setup.js` - Jest setup file with Next.js router and navigation mocks (created)
- `utils/exportUtils.test.ts` - Unit tests for JSON export functionality (created)
- `utils/moduleLoader.test.ts` - Unit tests for module normalization utilities (created)
- `tests/e2e/mobile-responsive.spec.ts` - Comprehensive E2E tests for mobile responsiveness including hamburger menu, navigation, and responsive layouts (created)
- `tests/e2e/source-filtering.spec.ts` - E2E tests for Community/Built-in filter functionality and filter combinations (created)
- `tests/e2e/navigation-edge-cases.spec.ts` - E2E tests for navigation edge cases including auto-redirects, 404 handling, URL validation, and navigation state (created)

### Notes

- Unit tests should typically be placed alongside the code files they are testing (e.g., `MyComponent.tsx` and `MyComponent.test.tsx` in the same directory).
- Use `npm run test:unit` to run Jest unit tests, `npm run test:e2e:prod` for E2E tests, or `npm run test:all` for both.
- Jest is configured with Next.js integration, JSDOM environment, and path mapping for `@/` imports.
