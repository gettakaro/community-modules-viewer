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

  // Add module pages
  for (const mod of modules) {
    // Module main page (redirects to latest version)
    urls.push({
      url: `${SITE_URL}/module/${encodeURIComponent(mod.name)}`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    });

    // Module version pages
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
