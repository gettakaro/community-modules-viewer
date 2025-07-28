/**
 * Utility functions for exporting module data
 */

import { ModuleWithMeta, ModuleVersion } from '@/lib/types';

/**
 * Export module data as JSON and trigger download
 * @param module - The module to export
 * @param version - Optional specific version to export (exports all if not provided)
 * @param filename - Optional custom filename (defaults to module name)
 */
export async function exportModuleAsJSON(
  module: ModuleWithMeta,
  version?: ModuleVersion,
  filename?: string,
): Promise<void> {
  // Check if this is a built-in module
  if (module.source === 'builtin') {
    alert(
      "Built-in modules are already included in Takaro by default and don't need to be downloaded.",
    );
    return;
  }

  // For community modules, fetch the raw JSON file
  if (!module.path) {
    console.error('Module path not available for download');
    alert('Unable to download this module - file path not found.');
    return;
  }

  try {
    // Convert file system path to URL path
    // module.path is like /home/.../public/modules/category/module.json
    // We need to extract just the relative path from 'modules' onwards
    const pathMatch = module.path.match(/public\/modules\/(.*\.json)$/);
    if (!pathMatch) {
      throw new Error('Invalid module path format');
    }

    const relativePath = pathMatch[1];
    const response = await fetch(`/modules/${relativePath}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch module file: ${response.status}`);
    }

    const rawJsonContent = await response.text();

    // If a specific version is requested, we need to parse and extract it
    let finalContent = rawJsonContent;
    if (version) {
      const moduleData = JSON.parse(rawJsonContent);
      const versionIndex = module.versions.findIndex(
        (v) => v.tag === version.tag,
      );

      if (
        versionIndex !== -1 &&
        moduleData.versions &&
        moduleData.versions[versionIndex]
      ) {
        // Create a new object with just this version
        const singleVersionModule = {
          ...moduleData,
          versions: [moduleData.versions[versionIndex]],
        };
        finalContent = JSON.stringify(singleVersionModule, null, 2);
      }
    }

    // Create blob and download link
    const blob = new Blob([finalContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    // Generate filename
    const defaultFilename = version
      ? `${module.name}-${version.tag}.json`
      : `${module.name}.json`;
    const finalFilename = filename || defaultFilename;

    // Create temporary link and trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = finalFilename;
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading module:', error);
    alert('Failed to download module. Please try again later.');
  }
}
