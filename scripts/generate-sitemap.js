#!/usr/bin/env node

/**
 * Generate sitemap.xml for the Community Modules Viewer
 * This script creates a sitemap with all available module pages
 * including both community and built-in modules
 */

const fs = require('fs').promises;
const path = require('path');

const SITE_URL = 'https://modules.takaro.io';

/**
 * Load all modules from both community and built-in sources
 */
async function loadAllModules() {
  const modules = [];

  // Load community modules
  const modulesDir = path.join(__dirname, '..', 'public', 'modules');
  try {
    await fs.access(modulesDir);

    const scanDirectory = async (dir) => {
      const items = await fs.readdir(dir, { withFileTypes: true });

      for (const item of items) {
        const itemPath = path.join(dir, item.name);

        if (item.isDirectory()) {
          await scanDirectory(itemPath);
        } else if (item.isFile() && item.name.endsWith('.json')) {
          try {
            const content = await fs.readFile(itemPath, 'utf-8');
            const moduleData = JSON.parse(content);
            if (moduleData.name && moduleData.versions) {
              modules.push(moduleData);
            }
          } catch (error) {
            console.warn(`Failed to load module ${item.name}:`, error.message);
          }
        }
      }
    };

    await scanDirectory(modulesDir);
  } catch (error) {
    console.warn('Failed to load community modules:', error.message);
  }

  // Load built-in modules
  const builtinDir = path.join(__dirname, '..', 'data', 'builtin-modules');
  try {
    await fs.access(builtinDir);
    const files = await fs.readdir(builtinDir);
    const jsonFiles = files.filter(file => file.endsWith('.json') && file !== 'index.json');

    for (const file of jsonFiles) {
      try {
        const filePath = path.join(builtinDir, file);
        const content = await fs.readFile(filePath, 'utf-8');
        const moduleData = JSON.parse(content);
        if (moduleData.name && moduleData.versions) {
          // Check if module already exists (community modules take precedence)
          const existingIndex = modules.findIndex(m => m.name === moduleData.name);
          if (existingIndex === -1) {
            modules.push(moduleData);
          }
        }
      } catch (error) {
        console.warn(`Failed to load built-in module ${file}:`, error.message);
      }
    }
  } catch (error) {
    console.info('No built-in modules found (this is normal if not fetched yet)');
  }

  return modules;
}

/**
 * Generate sitemap XML content
 */
function generateSitemapXML(urls) {
  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ];

  for (const url of urls) {
    xml.push('  <url>');
    xml.push(`    <loc>${url.loc}</loc>`);
    if (url.lastmod) {
      xml.push(`    <lastmod>${url.lastmod}</lastmod>`);
    }
    if (url.priority) {
      xml.push(`    <priority>${url.priority}</priority>`);
    }
    if (url.changefreq) {
      xml.push(`    <changefreq>${url.changefreq}</changefreq>`);
    }
    xml.push('  </url>');
  }

  xml.push('</urlset>');
  return xml.join('\n');
}

/**
 * Main function to generate the sitemap
 */
async function generateSitemap() {
  console.log('🗺️  Generating sitemap.xml...');

  try {
    const modules = await loadAllModules();
    console.log(`📦 Found ${modules.length} modules to include in sitemap`);

    const urls = [];
    const currentDate = new Date().toISOString().split('T')[0];

    // Add homepage
    urls.push({
      loc: SITE_URL,
      lastmod: currentDate,
      priority: '1.0',
      changefreq: 'daily',
    });

    // Add module pages
    for (const module of modules) {
      // Module main page (redirects to latest version)
      urls.push({
        loc: `${SITE_URL}/module/${encodeURIComponent(module.name)}`,
        lastmod: currentDate,
        priority: '0.8',
        changefreq: 'weekly',
      });

      // Module version pages
      if (module.versions && Array.isArray(module.versions)) {
        for (const version of module.versions) {
          if (version.tag) {
            urls.push({
              loc: `${SITE_URL}/module/${encodeURIComponent(module.name)}/${encodeURIComponent(version.tag)}`,
              lastmod: currentDate,
              priority: '0.7',
              changefreq: 'monthly',
            });
          }
        }
      }
    }

    // Sort URLs for consistent output
    urls.sort((a, b) => a.loc.localeCompare(b.loc));

    // Generate XML
    const sitemapXML = generateSitemapXML(urls);

    // Write to public directory
    const outputPath = path.join(__dirname, '..', 'public', 'sitemap.xml');
    await fs.writeFile(outputPath, sitemapXML, 'utf-8');

    console.log(`✅ Sitemap generated successfully with ${urls.length} URLs`);
    console.log(`📄 Saved to: ${outputPath}`);
  } catch (error) {
    console.error('❌ Failed to generate sitemap:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  generateSitemap().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { generateSitemap };