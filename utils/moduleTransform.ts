/**
 * Module Data Transformation
 * Transforms community module format to Takaro API format
 */

import type { ModuleWithMeta } from '@/lib/types';

/**
 * Transform module data from viewer format to Takaro API import format
 * Community modules are already mostly API-compatible, we just need to
 * extract the latest version and map a few fields.
 *
 * @param module - Module data from the community viewer
 * @returns Module data in Takaro API import format
 */
export function transformModuleForApi(module: ModuleWithMeta) {
  // Extract latest version or fall back to first version
  const latestVersion =
    module.versions.find((v) => v.tag === 'latest') || module.versions[0];

  if (!latestVersion) {
    throw new Error('Module has no versions');
  }

  return {
    name: module.name,
    ...latestVersion,
  };
}
