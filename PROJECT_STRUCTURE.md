# Project Structure

## Directory Layout

```
/app                    # Next.js App Router pages and layouts
  /module              # Module routing
    /[name]           # Dynamic route for module name
      /[version]      # Dynamic route for module version
        page.tsx      # Module version detail page
      page.tsx        # Module detail page (redirects to latest version)
  layout.tsx          # Root layout with global styles
  page.tsx            # Homepage (redirects to first module)
  globals.css         # Global CSS with Tailwind directives

/components           # React components
  ModuleSidebar.tsx   # Sidebar with module list and search
  ModuleDetails.tsx   # Main module details display
  ModuleCard.tsx      # Card component for module listing
  ConfigSection.tsx   # Configuration schema display
  CommandsSection.tsx # Commands list with code
  HooksSection.tsx    # Hooks display with implementation
  CronJobsSection.tsx # Cron jobs section
  PermissionsSection.tsx # Permissions display
  CollapsibleCode.tsx # Reusable code viewer

/utils                # Utility functions
  moduleLoader.ts     # Module data loading logic
  searchUtils.ts      # Search and filter utilities

/lib                  # Library code
  types.ts            # TypeScript interfaces
  github.ts           # GitHub API client

/modules              # JSON files for community modules
  *.json             # Individual module definitions

/tests
  /e2e               # Playwright end-to-end tests
    modules.spec.ts  # E2E tests for module functionality

/public              # Static assets (if needed)

## Key Files

- `next.config.js` - Next.js configuration for static export
- `tailwind.config.js` - Tailwind CSS with DaisyUI and Takaro theme
- `tsconfig.json` - TypeScript configuration
- `docker-compose.yml` - Development environment
- `.eslintrc.json` - ESLint configuration
- `.prettierrc` - Prettier configuration
```

## Development Notes

- Components follow the pattern: `ComponentName.tsx` with optional `ComponentName.test.tsx`
- Utilities are pure functions for data processing
- The `/lib` directory contains shared types and external API clients
- Module JSON files in `/modules` are loaded at build time
- All pages are statically generated at build time
