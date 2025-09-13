import { MetadataRoute } from 'next';
import { loadAllModules } from '@/utils/moduleLoader';

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
  for (const module of modules) {
    // Module main page (redirects to latest version)
    urls.push({
      url: `${SITE_URL}/module/${encodeURIComponent(module.name)}`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    });

    // Module version pages
    if (module.versions && Array.isArray(module.versions)) {
      for (const version of module.versions) {
        if (version.tag) {
          urls.push({
            url: `${SITE_URL}/module/${encodeURIComponent(module.name)}/${encodeURIComponent(version.tag)}`,
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
