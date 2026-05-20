import { MetadataRoute } from 'next';
import { loadAllModules } from '@/utils/moduleLoader';

export const dynamic = 'force-static';

const SITE_URL = 'https://modules.takaro.io';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const modules = await loadAllModules();
  const currentDate = new Date();

  const urls: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
  ];

  // Add module version pages. The module-level route is a static-export
  // redirect shell, so it should not be advertised as an indexable URL.
  for (const mod of modules) {
    if (mod.versions && Array.isArray(mod.versions)) {
      for (const version of mod.versions) {
        if (version.tag) {
          urls.push({
            url: `${SITE_URL}/module/${encodeURIComponent(mod.name)}/${encodeURIComponent(version.tag)}`,
            lastModified: currentDate,
            changeFrequency: 'monthly',
            priority: 0.7,
          });
        }
      }
    }
  }

  return urls;
}
