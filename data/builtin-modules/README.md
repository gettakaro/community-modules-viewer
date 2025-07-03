# Built-in Modules Directory

This directory contains built-in modules fetched from the Takaro GitHub repository during the build process.

## How it works

1. During `npm run build`, the pre-build script automatically fetches the latest built-in modules from GitHub
2. Module files are saved here as JSON files
3. The application loads these files at runtime (no API calls needed)

## Manual Update

To manually update built-in modules:

```bash
npm run fetch:modules
```

## Note

- These files are automatically generated and should not be edited manually
- The directory is excluded from version control (.gitignore)
- If the fetch fails during build, the app will still work with just community modules
