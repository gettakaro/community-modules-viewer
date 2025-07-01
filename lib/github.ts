import { Module, ModuleWithMeta, isModule } from '@/lib/types';

const GITHUB_API_BASE = 'https://api.github.com';
const REPO_OWNER = 'gettakaro';
const REPO_NAME = 'takaro';
const MODULES_PATH = 'packages/lib-modules/src/modules';

// Types for GitHub API responses
interface GitHubFile {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string;
  git_url: string;
  download_url: string | null;
  type: 'file' | 'dir';
}

// Cache for API responses to avoid rate limiting
const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Fetch all built-in modules from the Takaro GitHub repository
 * @returns Array of modules with metadata
 */
export async function fetchBuiltinModules(): Promise<ModuleWithMeta[]> {
  const modules: ModuleWithMeta[] = [];

  try {
    // Get the directory listing
    const files = await fetchGitHubDirectory(MODULES_PATH);

    // Filter for module files (both .ts and .json)
    const moduleFiles = files.filter(
      (file) =>
        file.type === 'file' &&
        (file.name.endsWith('.ts') || file.name.endsWith('.json')) &&
        !file.name.includes('.test.') &&
        !file.name.includes('.spec.'),
    );

    // Fetch and parse each module file
    for (const file of moduleFiles) {
      try {
        const mod = await fetchAndParseModule(file);
        if (mod) {
          modules.push(mod);
        }
      } catch (error) {
        console.warn(`Failed to parse module ${file.name}:`, error);
      }
    }

    // Sort modules alphabetically
    modules.sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error('Failed to fetch built-in modules:', error);
    // Return empty array on error
  }

  return modules;
}

/**
 * Fetch directory contents from GitHub API
 * @param path - Path within the repository
 * @returns Array of file/directory entries
 */
async function fetchGitHubDirectory(path: string): Promise<GitHubFile[]> {
  const url = `${GITHUB_API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}`;

  // Check cache
  const cached = getFromCache<GitHubFile[]>(url);
  if (cached) return cached;

  try {
    const response = await fetch(url, {
      headers: {
        Accept: 'application/vnd.github.v3+json',
        // Add user agent as required by GitHub API
        'User-Agent': 'community-modules-viewer',
      },
    });

    if (!response.ok) {
      throw new Error(
        `GitHub API error: ${response.status} ${response.statusText}`,
      );
    }

    const data = await response.json();

    // Cache the response
    setInCache(url, data);

    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Failed to fetch directory:', error);
    return [];
  }
}

/**
 * Fetch and parse a module file from GitHub
 * @param file - File metadata from GitHub API
 * @returns Module with metadata or null
 */
async function fetchAndParseModule(
  file: GitHubFile,
): Promise<ModuleWithMeta | null> {
  try {
    // Fetch the raw file content
    if (!file.download_url) {
      console.warn(`No download URL for file ${file.name}`);
      return null;
    }
    const content = await fetchGitHubFile(file.download_url);

    if (file.name.endsWith('.json')) {
      // Parse JSON directly
      const data = JSON.parse(content);
      if (isModule(data)) {
        return {
          ...data,
          source: 'builtin',
          path: file.html_url,
        };
      }
    } else if (file.name.endsWith('.ts')) {
      // Parse TypeScript module
      const moduleData = parseTypeScriptModule(content);
      if (moduleData && isModule(moduleData)) {
        return {
          ...moduleData,
          source: 'builtin',
          path: file.html_url,
        };
      }
    }
  } catch (error) {
    console.warn(`Failed to parse module ${file.name}:`, error);
  }

  return null;
}

/**
 * Fetch raw file content from GitHub
 * @param url - Direct download URL
 * @returns File content as string
 */
async function fetchGitHubFile(url: string): Promise<string> {
  // Check cache
  const cached = getFromCache<string>(url);
  if (cached) return cached;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.status}`);
    }

    const content = await response.text();

    // Cache the response
    setInCache(url, content);

    return content;
  } catch (error) {
    console.error('Failed to fetch file:', error);
    throw error;
  }
}

/**
 * Parse module definition from TypeScript source code
 * @param content - TypeScript file content
 * @returns Parsed module object or null
 */
function parseTypeScriptModule(content: string): Module | null {
  try {
    // Look for module exports in various formats
    // Format 1: export const moduleName = { ... }
    const exportConstMatch = content.match(
      /export\s+const\s+\w+\s*=\s*({[\s\S]*?})\s*;?\s*$/m,
    );

    if (exportConstMatch) {
      // Extract the object literal
      const objectLiteral = exportConstMatch[1];

      // Convert TypeScript object to JSON-like format
      // This is a simplified parser - in production, you might want to use a proper AST parser
      const jsonLike = objectLiteral
        .replace(/(['"])?(\w+)(['"])?\s*:/g, '"$2":') // Quote keys
        .replace(/`([^`]*)`/g, '"$1"') // Convert template literals to strings
        .replace(/\n\s*\/\/.*$/gm, '') // Remove single-line comments
        .replace(/\/\*[\s\S]*?\*\//g, '') // Remove multi-line comments
        .replace(/,\s*}/g, '}') // Remove trailing commas
        .replace(/,\s*]/g, ']'); // Remove trailing commas in arrays

      // Try to parse as JSON
      const parsed = JSON.parse(jsonLike);
      return parsed;
    }

    // Format 2: export default { ... }
    const exportDefaultMatch = content.match(
      /export\s+default\s+({[\s\S]*?})\s*;?\s*$/m,
    );

    if (exportDefaultMatch) {
      const objectLiteral = exportDefaultMatch[1];
      const jsonLike = objectLiteral
        .replace(/(['"])?(\w+)(['"])?\s*:/g, '"$2":')
        .replace(/`([^`]*)`/g, '"$1"')
        .replace(/\n\s*\/\/.*$/gm, '')
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/,\s*}/g, '}')
        .replace(/,\s*]/g, ']');

      const parsed = JSON.parse(jsonLike);
      return parsed;
    }
  } catch (error) {
    console.warn('Failed to parse TypeScript module:', error);
  }

  return null;
}

/**
 * Get data from cache if not expired
 * @param key - Cache key
 * @returns Cached data or null
 */
function getFromCache<T = unknown>(key: string): T | null {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data as T;
  }
  return null;
}

/**
 * Set data in cache
 * @param key - Cache key
 * @param data - Data to cache
 */
function setInCache(key: string, data: unknown): void {
  cache.set(key, { data, timestamp: Date.now() });
}

/**
 * Clear the cache (useful for development)
 */
export function clearCache(): void {
  cache.clear();
}
