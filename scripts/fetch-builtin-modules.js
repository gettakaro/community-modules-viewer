#!/usr/bin/env node

/**
 * Fetch built-in modules from GitHub at build time
 * This script downloads module definitions from the Takaro repository
 * and saves them locally to avoid runtime API calls
 */

const fs = require('fs').promises;
const path = require('path');
const https = require('https');

// Configuration
const MODULES_JSON_URL =
  'https://raw.githubusercontent.com/gettakaro/takaro/refs/heads/development/packages/web-docs/docs/modules/modules.json';
const OUTPUT_DIR = path.join(__dirname, '..', 'data', 'builtin-modules');

/**
 * Fetch raw content from URL
 */
function fetchRawContent(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(data);
          } else {
            reject(new Error(`HTTP ${res.statusCode} fetching ${url}`));
          }
        });
      })
      .on('error', reject);
  });
}

/**
 * Transform module from Takaro JSON format to our expected format
 */
function transformModule(moduleData) {
  const transformed = {
    name: moduleData.name,
    source: 'builtin',
    takaroVersion: '>=0.0.1',
    versions: [],
  };

  // Transform each version
  for (const version of moduleData.versions) {
    const transformedVersion = {
      tag: version.tag,
      description: version.description || `Built-in module: ${moduleData.name}`,
      configSchema: version.configSchema || '{}',
      uiSchema: version.uiSchema || '{}',
      commands: [],
      hooks: [],
      cronJobs: [],
      functions: [],
      permissions: version.permissions || [],
    };

    // Transform commands
    if (version.commands) {
      for (const command of version.commands) {
        // Transform arguments and filter out null defaultValue fields
        const transformedArguments = (command.arguments || []).map((arg) => {
          const transformedArg = {
            name: arg.name,
            type: arg.type,
            helpText: arg.helpText,
            position: arg.position,
          };

          // Only include defaultValue if it's not null
          if (arg.defaultValue !== null && arg.defaultValue !== undefined) {
            transformedArg.defaultValue = arg.defaultValue;
          }

          return transformedArg;
        });

        transformedVersion.commands.push({
          name: command.name,
          trigger: command.trigger,
          helpText:
            command.helpText ||
            `Execute ${command.name || command.trigger} command`,
          arguments: transformedArguments,
          function:
            command.function ||
            `// Command implementation for ${command.name || command.trigger}`,
        });
      }
    }

    // Transform hooks
    if (version.hooks) {
      for (const hook of version.hooks) {
        transformedVersion.hooks.push({
          name: hook.name,
          eventType: hook.eventType,
          description: hook.description || `Hook for ${hook.eventType} events`,
          function: hook.function || `// Hook implementation for ${hook.name}`,
        });
      }
    }

    // Transform cron jobs
    if (version.cronJobs) {
      for (const cronJob of version.cronJobs) {
        transformedVersion.cronJobs.push({
          name: cronJob.name,
          temporalValue: cronJob.temporalValue || '0 0 * * *', // Default to daily at midnight if missing
          function:
            cronJob.function ||
            `// Cron job implementation for ${cronJob.name}`,
        });
      }
    }

    // Transform functions
    if (version.functions) {
      for (const func of version.functions) {
        transformedVersion.functions.push({
          name: func.name,
          function:
            func.function || `// Function implementation for ${func.name}`,
        });
      }
    }

    transformed.versions.push(transformedVersion);
  }

  return transformed;
}

/**
 * Fetch and save all built-in modules
 */
async function fetchBuiltinModules() {
  console.log('🔄 Fetching built-in modules from Takaro JSON...');

  try {
    // Create output directory
    await fs.mkdir(OUTPUT_DIR, { recursive: true });

    // Fetch the modules JSON
    console.log(`📥 Fetching modules from: ${MODULES_JSON_URL}`);
    const jsonContent = await fetchRawContent(MODULES_JSON_URL);
    const modulesData = JSON.parse(jsonContent);

    console.log(`📦 Found ${modulesData.length} built-in modules to process`);

    let successCount = 0;
    const moduleNames = [];

    // Process each module
    for (const moduleData of modulesData) {
      try {
        console.log(`  ⏳ Processing module: ${moduleData.name}...`);

        // Transform to our expected format
        const transformedModule = transformModule(moduleData);

        // Add GitHub path for reference
        transformedModule.path = `https://github.com/gettakaro/takaro/blob/development/packages/lib-modules/src/modules/${moduleData.name}/index.ts`;

        // Save to file
        const outputPath = path.join(
          OUTPUT_DIR,
          `${transformedModule.name}.json`,
        );
        await fs.writeFile(
          outputPath,
          JSON.stringify(transformedModule, null, 2),
        );

        moduleNames.push(transformedModule.name);
        successCount++;
        console.log(`  ✅ Saved ${transformedModule.name}`);
      } catch (error) {
        console.error(
          `  ❌ Failed to process ${moduleData.name}:`,
          error.message,
        );
      }
    }

    // Create an index file for quick reference
    const indexPath = path.join(OUTPUT_DIR, 'index.json');
    await fs.writeFile(
      indexPath,
      JSON.stringify(
        {
          fetchedAt: new Date().toISOString(),
          totalModules: successCount,
          modules: moduleNames.sort(),
        },
        null,
        2,
      ),
    );

    console.log(`\n✅ Successfully fetched ${successCount} built-in modules`);
    console.log(`📁 Modules saved to: ${OUTPUT_DIR}`);

    if (successCount === 0) {
      console.warn('\n⚠️  Warning: No modules were successfully fetched!');
      console.warn(
        'This might be due to network issues or changes in the JSON format.',
      );
      console.warn(
        'The build will continue but built-in modules will not be available.',
      );
    }
  } catch (error) {
    console.error('\n❌ Failed to fetch built-in modules:', error.message);

    // Check if we have cached modules
    try {
      await fs.access(OUTPUT_DIR);
      const files = await fs.readdir(OUTPUT_DIR);
      const moduleCount = files.filter(
        (f) => f.endsWith('.json') && f !== 'index.json',
      ).length;
      if (moduleCount > 0) {
        console.log(
          `\n📦 Using ${moduleCount} cached built-in modules from previous fetch`,
        );
        return;
      }
    } catch (e) {
      // No cache available
    }

    console.warn('\n⚠️  Build will continue without built-in modules');
  }
}

// Run if called directly
if (require.main === module) {
  fetchBuiltinModules().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { fetchBuiltinModules };
