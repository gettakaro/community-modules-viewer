import { Module, ModuleWithMeta, isModule, ModuleSource } from '@/lib/types';
import { fetchBuiltinModules } from '@/lib/github';
import fs from 'fs/promises';
import path from 'path';

/**
 * Load all community modules from the local modules directory
 * @returns Array of modules with metadata
 */
export async function loadLocalModules(): Promise<ModuleWithMeta[]> {
  const modules: ModuleWithMeta[] = [];
  const modulesDir = path.join(process.cwd(), 'modules');

  try {
    // Check if modules directory exists
    await fs.access(modulesDir);

    // Read all files in the modules directory
    const files = await fs.readdir(modulesDir);

    // Filter for JSON files only
    const jsonFiles = files.filter((file) => file.endsWith('.json'));

    // Load each module file
    for (const file of jsonFiles) {
      const module = await loadModuleFile(file);
      if (module) {
        modules.push(module);
      }
    }

    // Sort modules alphabetically by name
    modules.sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.warn('Failed to read modules directory:', error);
    // Return empty array if directory doesn't exist or can't be read
  }

  return modules;
}

/**
 * Load a single module file from the modules directory
 * @param filename - Name of the JSON file to load
 * @returns Module with metadata or null if invalid
 */
export async function loadModuleFile(
  filename: string,
): Promise<ModuleWithMeta | null> {
  const modulesDir = path.join(process.cwd(), 'modules');
  const filePath = path.join(modulesDir, filename);

  try {
    // Read the file content
    const content = await fs.readFile(filePath, 'utf-8');

    // Parse JSON
    const data = JSON.parse(content);

    // Validate the module structure
    if (!isModule(data)) {
      console.warn(`Invalid module structure in ${filename}`);
      return null;
    }

    // Add metadata
    const moduleWithMeta: ModuleWithMeta = {
      ...data,
      source: 'community',
      path: filePath,
    };

    return moduleWithMeta;
  } catch (error) {
    if (error instanceof SyntaxError) {
      console.warn(`Invalid JSON in ${filename}:`, error.message);
    } else {
      console.warn(`Failed to load module ${filename}:`, error);
    }
    return null;
  }
}

/**
 * Load all modules from both local and GitHub sources
 * Community modules take precedence over built-in modules with the same name
 * @returns Array of all modules with metadata
 */
export async function loadAllModules(): Promise<ModuleWithMeta[]> {
  try {
    // Load from both sources in parallel for better performance
    const [localModules, builtinModules] = await Promise.all([
      loadLocalModules(),
      fetchBuiltinModules(),
    ]);

    // Use a Map for deduplication by module name
    const moduleMap = new Map<string, ModuleWithMeta>();

    // Add built-in modules first
    builtinModules.forEach((mod) => {
      moduleMap.set(mod.name, mod);
    });

    // Add community modules (overwrites built-in if same name exists)
    // This gives preference to community modules
    localModules.forEach((mod) => {
      if (moduleMap.has(mod.name)) {
        console.info(
          `Community module '${mod.name}' overrides built-in module`,
        );
      }
      moduleMap.set(mod.name, mod);
    });

    // Convert back to array and sort alphabetically
    const allModules = Array.from(moduleMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name),
    );

    console.info(
      `Loaded ${allModules.length} modules (${localModules.length} community, ${builtinModules.length} built-in)`,
    );

    return allModules;
  } catch (error) {
    console.error('Failed to load all modules:', error);
    // Try to return at least local modules if GitHub fetch fails
    try {
      const localModules = await loadLocalModules();
      console.warn(
        'Falling back to local modules only due to aggregation error',
      );
      return localModules;
    } catch (localError) {
      console.error('Failed to load even local modules:', localError);
      return [];
    }
  }
}

/**
 * Load modules filtered by source type
 * @param source - Filter modules by source ('community' or 'builtin')
 * @returns Array of modules from the specified source
 */
export async function loadModulesBySource(
  source: ModuleSource,
): Promise<ModuleWithMeta[]> {
  if (source === 'community') {
    return loadLocalModules();
  } else if (source === 'builtin') {
    return fetchBuiltinModules();
  } else {
    throw new Error(`Invalid module source: ${source}`);
  }
}

/**
 * Get module loading statistics
 * @returns Object with counts of modules by source
 */
export async function getModuleStats(): Promise<{
  total: number;
  community: number;
  builtin: number;
  duplicates: string[];
}> {
  const [localModules, builtinModules] = await Promise.all([
    loadLocalModules(),
    fetchBuiltinModules(),
  ]);

  const localNames = new Set(localModules.map((m) => m.name));
  const builtinNames = new Set(builtinModules.map((m) => m.name));

  // Find duplicates (modules that exist in both sources)
  const duplicates = Array.from(localNames).filter((name) =>
    builtinNames.has(name),
  );

  // Total unique modules
  const allNames = new Set([...localNames, ...builtinNames]);

  return {
    total: allNames.size,
    community: localModules.length,
    builtin: builtinModules.length,
    duplicates: duplicates.sort(),
  };
}

/**
 * Load modules for static generation at build time
 * This function is designed to work in Next.js getStaticProps context
 * @returns Array of modules with metadata
 */
export async function loadModulesForBuild(): Promise<ModuleWithMeta[]> {
  // Now loads from both sources with aggregation
  return loadAllModules();
}

/**
 * Get a specific module by name
 * @param name - Module name to find
 * @returns Module with metadata or null if not found
 */
export async function getModuleByName(
  name: string,
): Promise<ModuleWithMeta | null> {
  const modules = await loadAllModules();
  return modules.find((module) => module.name === name) || null;
}

/**
 * Get all unique module names (for static path generation)
 * @returns Array of module names
 */
export async function getAllModuleNames(): Promise<string[]> {
  const modules = await loadAllModules();
  return modules.map((module) => module.name);
}

/**
 * Get all module/version combinations (for static path generation)
 * @returns Array of {name, version} objects
 */
export async function getAllModuleVersionPaths(): Promise<
  Array<{ name: string; version: string }>
> {
  const modules = await loadAllModules();
  const paths: Array<{ name: string; version: string }> = [];

  for (const module of modules) {
    for (const version of module.versions) {
      paths.push({
        name: module.name,
        version: version.tag,
      });
    }
  }

  return paths;
}

/**
 * Normalize module data for consistent structure
 * Ensures all modules have required fields with proper defaults
 * @param modules - Array of modules to normalize
 * @returns Array of normalized modules
 */
export function normalizeModules(modules: ModuleWithMeta[]): ModuleWithMeta[] {
  return modules.map((module) => ({
    ...module,
    // Ensure versions array exists and normalize each version
    versions: (module.versions || []).map((version) => ({
      ...version,
      // Provide defaults for optional fields
      description: version.description || '',
      configSchema: version.configSchema || '{}',
      uiSchema: version.uiSchema || '{}',
      commands: version.commands || [],
      hooks: version.hooks || [],
      cronJobs: version.cronJobs || [],
      functions: version.functions || [],
      permissions: version.permissions || [],
    })),
  }));
}
