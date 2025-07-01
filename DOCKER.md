# Docker Development Guide

## Development

To run the application in development mode with Docker:

```bash
# Build and start the development container
npm run docker:dev

# Or manually:
docker compose up

# To rebuild the container
npm run docker:build

# To stop the container
npm run docker:down
```

The application will be available at http://localhost:3000 with hot-reloading enabled.

## Production

To build and run the production container:

```bash
# Build the production container
npm run docker:prod:build

# Run the production container
npm run docker:prod
```

## Docker Commands

- `npm run docker:dev` - Start development environment
- `npm run docker:build` - Build development container
- `npm run docker:down` - Stop all containers
- `npm run docker:prod` - Start production environment
- `npm run docker:prod:build` - Build production container

## Notes

- The development container mounts the local directory for hot-reloading
- Node modules are stored in a separate volume to avoid conflicts
- Production build creates a static export served by a lightweight server