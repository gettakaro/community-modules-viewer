# Docker Environment

This project uses Docker with a **static-first approach** for realistic testing.

## Quick Start

### Default (Static Build - Recommended)

Start the static build server:

```bash
npm run docker:up
# or
docker compose up
```

This will:

- Build the Next.js application as static files
- Serve static files using a simple HTTP server
- Make the app available at http://localhost:3001
- No hydration, no dev server - pure static files

### Development Mode (When Needed)

For active development with hot reloading:

```bash
npm run docker:dev
```

This enables:

- Next.js development server
- Hot module reloading
- Development features

## Available Commands

| Command                    | Description                                                |
| -------------------------- | ---------------------------------------------------------- |
| `npm run docker:up`        | **Default**: Static build server (recommended for testing) |
| `npm run docker:build`     | Build the static Docker image                              |
| `npm run docker:down`      | Stop all containers                                        |
| `npm run docker:dev`       | Development server with hot reloading                      |
| `npm run docker:dev:build` | Build development Docker image                             |
| `npm run docker:prod`      | Production static server (same as default)                 |

## Why Static First?

- **Realistic Testing**: Tests the actual static files users receive
- **No Hydration Issues**: Pure static HTML/CSS/JS
- **Faster**: No server-side processing
- **Production-Like**: Matches deployment environment

## Configuration

- **Port**: 3001 (mapped from container port 3000)
- **Static Files**: Generated in `out/` directory
- **Server**: Uses `serve` package for static file serving

## Troubleshooting

- **Port conflicts**: Ensure port 3001 is available
- **Build issues**: Run `docker compose build --no-cache` to rebuild
- **Static files**: Check `out/` directory is generated after build
- **Styling issues**: Use static build (default) instead of dev server
