import {
  Module,
  ModuleWithMeta,
  ModuleSource,
  ModuleLoadResult,
  ModuleValidationError,
  validateModule,
  validateModuleWithMeta,
  formatValidationError,
  ModuleSchema,
} from '@/lib/types';
import fs from 'fs/promises';
import path from 'path';

/**
 * Load all community modules from the local modules directory with detailed error reporting
 * @param reportErrors - Whether to return detailed error information
 * @returns Array of modules with metadata or detailed load result
 */
export async function loadLocalModules(): Promise<ModuleWithMeta[]>;
export async function loadLocalModules(
  reportErrors: true,
): Promise<ModuleLoadResult>;
export async function loadLocalModules(
  reportErrors?: boolean,
): Promise<ModuleWithMeta[] | ModuleLoadResult> {
  const modules: ModuleWithMeta[] = [];
  const errors: ModuleValidationError[] = [];
  const modulesDir = path.join(process.cwd(), 'modules');
  let attempted = 0;

  try {
    // Check if modules directory exists
    await fs.access(modulesDir);

    // Read all files in the modules directory
    const files = await fs.readdir(modulesDir);

    // Filter for JSON files only
    const jsonFiles = files.filter((file) => file.endsWith('.json'));
    attempted = jsonFiles.length;

    // Load each module file
    for (const file of jsonFiles) {
      if (reportErrors) {
        const result = await loadModuleFileWithErrors(file);
        if (result.success) {
          modules.push(result.module);
        } else {
          errors.push(result.error);
        }
      } else {
        const module = await loadModuleFile(file);
        if (module) {
          modules.push(module);
        }
      }
    }

    // Sort modules alphabetically by name
    modules.sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    const errorMessage = `Failed to read modules directory: ${error}`;
    console.warn(errorMessage);

    if (reportErrors) {
      errors.push({
        source: modulesDir,
        error: new Error(errorMessage) as any,
        message: errorMessage,
        data: null,
      });
    }
  }

  if (reportErrors) {
    return {
      modules,
      errors,
      stats: {
        attempted,
        successful: modules.length,
        failed: errors.length,
      },
    };
  }

  return modules;
}

/**
 * Load a single module file with detailed error reporting
 * @param filename - Name of the JSON file to load
 * @returns Success result with module or error details
 */
async function loadModuleFileWithErrors(
  filename: string,
): Promise<
  | { success: true; module: ModuleWithMeta }
  | { success: false; error: ModuleValidationError }
> {
  const modulesDir = path.join(process.cwd(), 'modules');
  const filePath = path.join(modulesDir, filename);

  try {
    // Read the file content
    const content = await fs.readFile(filePath, 'utf-8');

    // Parse JSON
    const rawData = JSON.parse(content);

    // Validate the module structure using Zod
    const validation = validateModule(rawData);

    if (!validation.success) {
      return {
        success: false,
        error: {
          source: filename,
          error: validation.error,
          message: formatValidationError(validation.error, filename),
          data: rawData,
        },
      };
    }

    // Add metadata and validate the complete structure
    const moduleWithMeta = {
      ...validation.data,
      source: 'community' as const,
      path: filePath,
    };

    const metaValidation = validateModuleWithMeta(moduleWithMeta);
    if (!metaValidation.success) {
      return {
        success: false,
        error: {
          source: filename,
          error: metaValidation.error,
          message: formatValidationError(metaValidation.error, filename),
          data: moduleWithMeta,
        },
      };
    }

    return { success: true, module: metaValidation.data };
  } catch (error) {
    const message =
      error instanceof SyntaxError
        ? `Invalid JSON in ${filename}: ${error.message}`
        : `Failed to load module ${filename}: ${error}`;

    return {
      success: false,
      error: {
        source: filename,
        error: error as any,
        message,
        data: null,
      },
    };
  }
}

/**
 * Load a single module file from the modules directory with Zod validation
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
    const rawData = JSON.parse(content);

    // Validate the module structure using Zod
    const validation = validateModule(rawData);

    if (!validation.success) {
      const errorMessage = formatValidationError(validation.error, filename);
      console.warn(errorMessage);
      return null;
    }

    // Add metadata and validate the complete structure
    const moduleWithMeta = {
      ...validation.data,
      source: 'community' as const,
      path: filePath,
    };

    const metaValidation = validateModuleWithMeta(moduleWithMeta);
    if (!metaValidation.success) {
      const errorMessage = formatValidationError(
        metaValidation.error,
        filename,
      );
      console.warn(errorMessage);
      return null;
    }

    return metaValidation.data;
  } catch (error) {
    if (error instanceof SyntaxError) {
      console.warn(`Invalid JSON in ${filename}: ${error.message}`);
    } else {
      console.warn(`Failed to load module ${filename}:`, error);
    }
    return null;
  }
}

/**
 * Load built-in modules from local files (populated at build time)
 * @returns Array of built-in modules with metadata
 */
export async function loadBuiltinModules(): Promise<ModuleWithMeta[]> {
  const modules: ModuleWithMeta[] = [];
  const builtinDir = path.join(process.cwd(), 'data', 'builtin-modules');

  try {
    // Check if builtin modules directory exists
    await fs.access(builtinDir);

    // Read all files in the builtin modules directory
    const files = await fs.readdir(builtinDir);

    // Filter for JSON files only (skip index.json)
    const jsonFiles = files.filter(
      (file) => file.endsWith('.json') && file !== 'index.json',
    );

    // Load each module file
    for (const file of jsonFiles) {
      try {
        const filePath = path.join(builtinDir, file);
        const content = await fs.readFile(filePath, 'utf-8');
        const moduleData = JSON.parse(content);

        // Validate the module structure
        const validation = validateModule(moduleData);
        if (validation.success) {
          const moduleWithMeta = {
            ...validation.data,
            source: 'builtin' as const,
            path: filePath,
          };

          const metaValidation = validateModuleWithMeta(moduleWithMeta);
          if (metaValidation.success) {
            modules.push(metaValidation.data);
          } else {
            console.warn(
              `Invalid built-in module structure in ${file}:`,
              formatValidationError(metaValidation.error, file),
            );
          }
        } else {
          console.warn(
            `Invalid built-in module in ${file}:`,
            formatValidationError(validation.error, file),
          );
        }
      } catch (error) {
        console.warn(`Failed to load built-in module ${file}:`, error);
      }
    }

    // Sort modules alphabetically
    modules.sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    // Built-in modules directory doesn't exist or couldn't be read
    // This is not fatal - the app works fine with just community modules
    console.info(
      'No built-in modules found (this is normal if not fetched yet)',
    );
  }

  return modules;
}

/**
 * Load all modules from both local and built-in sources
 * Community modules take precedence over built-in modules with the same name
 * @returns Array of all modules with metadata
 */
export async function loadAllModules(): Promise<ModuleWithMeta[]> {
  try {
    // Load from both sources in parallel for better performance
    const [localModules, builtinModules] = await Promise.all([
      loadLocalModules(),
      loadBuiltinModules(),
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
    // Try to return at least local modules if built-in loading fails
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
    return loadBuiltinModules();
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
    loadBuiltinModules(),
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
