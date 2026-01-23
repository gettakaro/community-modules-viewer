## Module Naming Conventions

- Module files and titles must NEVER contain spaces or special characters
- Use hyphens or camelCase for multi-word names (e.g., `my-module` or `myModule`)
- This applies to both the filename and the `name` field in module JSON files

## Development Guidelines

- NEVER run the app on the host directly. Always use the docker compose environment to start/stop/run the app

## Pre-commit Checks

- Always run `npm run format:check` before pushing to ensure code formatting is correct
- If formatting issues are found, run `npm run format` to auto-fix them

## Testing

### E2E Tests

- **Production tests**: `npm run test:e2e:prod` - Builds prod container and runs Playwright tests
- **Dev tests**: `npm run test:e2e:dev` - Runs tests against dev server
- **Manual prod test**:
  ```bash
  docker build -f Dockerfile.prod -t modules-prod .
  docker run -p 3002:80 modules-prod
  # Visit http://localhost:3002
  ```

### Key Points

- Tests use Playwright for smoke testing core functionality
- Production tests build and test against nginx-served static files
- Port 3002 is used for test containers to avoid conflicts
