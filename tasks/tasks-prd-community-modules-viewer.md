## Tasks

- [x] 1.0 Set up project foundation and development environment
  - [x] 1.1 Initialize Next.js 15 project with TypeScript and App Router
  - [x] 1.2 Configure Tailwind CSS with DaisyUI and custom Takaro theme colors
  - [x] 1.3 Set up Docker Compose development environment
  - [x] 1.4 Configure ESLint and Prettier with project standards
  - [x] 1.5 Create basic project folder structure as per PRD
  - [x] 1.6 Set up TypeScript interfaces in lib/types.ts for module data structures

- [ ] 2.0 Implement module data loading and processing system
  - [ ] 2.1 [depends on: 1.6] Create moduleLoader utility for reading local JSON files
  - [ ] 2.2 [depends on: 1.6] Implement GitHub API client for fetching built-in modules
  - [ ] 2.3 [depends on: 2.1, 2.2] Create module data aggregation and normalization logic
  - [ ] 2.4 [depends on: 2.3] Implement static page generation for all module/version combinations
  - [ ] 2.5 [depends on: 2.1] Add module data validation and error handling

- [ ] 3.0 Build core UI components with Takaro design system
  - [ ] 3.1 [depends on: 1.2] Create root layout with dark theme and global styles
  - [ ] 3.2 [depends on: 3.1] Build ModuleCard component with Takaro styling
  - [ ] 3.3 [depends on: 3.1] Implement CollapsibleCode component with PrismJS integration
  - [ ] 3.4 [depends on: 1.6] Create section components (Config, Commands, Hooks, CronJobs, Permissions)
  - [ ] 3.5 [depends on: 3.2, 3.4] Build ModuleDetails main component

- [ ] 4.0 Create module browsing and navigation features
  - [ ] 4.1 [depends on: 2.3, 3.2] Build ModuleSidebar with module listing
  - [ ] 4.2 [depends on: 4.1] Implement sidebar collapse/expand functionality with LocalStorage
  - [ ] 4.3 [depends on: 2.4] Create dynamic routing pages for modules
  - [ ] 4.4 [depends on: 4.3] Implement auto-redirect logic for homepage and version routes
  - [ ] 4.5 [depends on: 3.5, 4.3] Connect module detail pages with ModuleDetails component

- [ ] 5.0 Implement search, filtering, and export functionality
  - [ ] 5.1 [depends on: 4.1] Add search input to ModuleSidebar
  - [ ] 5.2 [depends on: 5.1] Create searchUtils for real-time filtering
  - [ ] 5.3 [depends on: 5.2] Implement search result counts display
  - [ ] 5.4 [depends on: 5.1] Add LocalStorage persistence for search state
  - [ ] 5.5 [depends on: 3.5] Implement JSON export functionality with download
  - [ ] 5.6 [depends on: 4.5] Add version selector dropdown to module details

- [ ] 6.0 Add testing, CI/CD, and production optimization
  - [ ] 6.1 [depends on: 3.0] Write unit tests for all components
  - [ ] 6.2 [depends on: 2.0] Write unit tests for utility functions
  - [ ] 6.3 [depends on: 5.0] Create Playwright E2E tests for critical user flows
  - [ ] 6.4 [depends on: 1.0] Set up GitHub Actions CI/CD pipeline
  - [ ] 6.5 [depends on: 4.0, 5.0] Implement lazy loading for code highlighting
  - [ ] 6.6 [depends on: 6.3] Add mobile responsive design and test on various devices

## Relevant Files

- `app/layout.tsx` - Root layout with Takaro-aligned dark theme and global styles (created - basic structure)
- `app/page.tsx` - Homepage with auto-redirect to first module (created - placeholder)
- `package.json` - Updated with Next.js 15, React, and TypeScript dependencies
- `tsconfig.json` - TypeScript configuration for Next.js
- `next.config.js` - Next.js configuration with static export settings
- `.gitignore` - Already existed with proper Next.js entries
- `tailwind.config.js` - Tailwind configuration with DaisyUI and Takaro theme colors (created)
- `postcss.config.js` - PostCSS configuration for Tailwind CSS (created)
- `app/globals.css` - Global styles with Tailwind directives (created)
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
- `app/module/[name]/page.tsx` - Module detail page with version redirect
- `app/module/[name]/[version]/page.tsx` - Module version detail page
- `components/ModuleSidebar.tsx` - Collapsible sidebar with module list and search
- `components/ModuleSidebar.test.tsx` - Unit tests for sidebar component
- `components/ModuleDetails.tsx` - Main module details display component
- `components/ModuleDetails.test.tsx` - Unit tests for module details
- `components/ModuleCard.tsx` - Card component for module display in sidebar
- `components/ConfigSection.tsx` - Configuration schema display component
- `components/CommandsSection.tsx` - Commands list with collapsible code
- `components/HooksSection.tsx` - Hooks display with implementation code
- `components/CronJobsSection.tsx` - Cron jobs section component
- `components/PermissionsSection.tsx` - Permissions display component
- `components/CollapsibleCode.tsx` - Reusable code viewer with syntax highlighting
- `utils/moduleLoader.ts` - Module data fetching and processing utilities
- `utils/moduleLoader.test.ts` - Unit tests for module loader
- `utils/searchUtils.ts` - Search and filter utility functions
- `utils/searchUtils.test.ts` - Unit tests for search utilities
- `lib/github.ts` - GitHub API client for fetching built-in modules
- `lib/types.ts` - TypeScript interfaces for module data structures (created)
- `tailwind.config.js` - Tailwind configuration with Takaro theme colors
- `docker-compose.yml` - Docker development environment configuration
- `.github/workflows/ci.yml` - CI/CD pipeline configuration
- `tests/e2e/modules.spec.ts` - Playwright E2E tests

### Notes

- Unit tests should typically be placed alongside the code files they are testing (e.g., `MyComponent.tsx` and `MyComponent.test.tsx` in the same directory).
- Use `npx jest [optional/path/to/test/file]` to run tests. Running without a path executes all tests found by the Jest configuration.
