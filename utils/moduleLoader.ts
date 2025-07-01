import { Module, ModuleWithMeta, isModule } from '@/lib/types';
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
 * Load modules for static generation at build time
 * This function is designed to work in Next.js getStaticProps context
 * @returns Array of modules with metadata
 */
export async function loadModulesForBuild(): Promise<ModuleWithMeta[]> {
  // For now, just load local modules
  // Later this will also fetch from GitHub
  return loadLocalModules();
}

/**
 * Get a specific module by name
 * @param name - Module name to find
 * @returns Module with metadata or null if not found
 */
export async function getModuleByName(
  name: string,
): Promise<ModuleWithMeta | null> {
  const modules = await loadLocalModules();
  return modules.find((module) => module.name === name) || null;
}

/**
 * Get all unique module names (for static path generation)
 * @returns Array of module names
 */
export async function getAllModuleNames(): Promise<string[]> {
  const modules = await loadLocalModules();
  return modules.map((module) => module.name);
}

/**
 * Get all module/version combinations (for static path generation)
 * @returns Array of {name, version} objects
 */
export async function getAllModuleVersionPaths(): Promise<
  Array<{ name: string; version: string }>
> {
  const modules = await loadLocalModules();
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
