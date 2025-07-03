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
export function exportModuleAsJSON(
  module: ModuleWithMeta,
  version?: ModuleVersion,
  filename?: string,
): void {
  // Prepare the export data
  const exportData = version
    ? {
        // Export single version with module metadata
        name: module.name,
        source: module.source,
        takaroVersion: module.takaroVersion,
        version: version.tag,
        description: version.description,
        configSchema: version.configSchema,
        uiSchema: version.uiSchema,
        commands: version.commands,
        hooks: version.hooks,
        cronJobs: version.cronJobs,
        permissions: version.permissions,
      }
    : {
        // Export complete module with all versions
        name: module.name,
        source: module.source,
        takaroVersion: module.takaroVersion,
        versions: module.versions.map((v) => ({
          tag: v.tag,
          description: v.description,
          configSchema: v.configSchema,
          uiSchema: v.uiSchema,
          commands: v.commands,
          hooks: v.hooks,
          cronJobs: v.cronJobs,
          permissions: v.permissions,
        })),
      };

  // Convert to JSON with pretty formatting
  const jsonString = JSON.stringify(exportData, null, 2);

  // Create blob and download link
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  // Generate filename
  const defaultFilename = version
    ? `${module.name}-${version.tag}.json`
    : `${module.name}-all-versions.json`;
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
}
