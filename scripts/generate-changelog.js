#!/usr/bin/env node

/**
 * Generates changelog data by analyzing git history of module JSON files
 * Extracts commit information and JSON diffs for AI-powered changelog generation
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const MODULES_DIR = 'public/modules';
const OLD_MODULES_DIR = 'modules'; // Before July 2025, modules were stored here
const OUTPUT_FILE = 'data/changelog-raw.json';

/**
 * Get all commits that modified module JSON files
 * @param {string|null} sinceCommit - Optional commit hash to start from (exclusive)
 * @returns {Array} Array of commit objects with hash, date, author, message
 */
function getModuleCommits(sinceCommit = null) {
  try {
    // Build git log command to include all module locations:
    // 1. public/modules/**/*.json (current, after July 2025, in category subfolders)
    // 2. public/modules/*.json (current, root-level modules)
    // 3. modules/**/*.json (after categorization, before move to public)
    // 4. modules/*.json (before categorization)
    let gitCommand = `git log --pretty=format:"%H|%aI|%an|%s" --name-only -- ${MODULES_DIR}/**/*.json ${MODULES_DIR}/*.json ${OLD_MODULES_DIR}/**/*.json ${OLD_MODULES_DIR}/*.json`;

    // If we have a sinceCommit, only get commits after it
    if (sinceCommit) {
      gitCommand = `git log ${sinceCommit}..HEAD --pretty=format:"%H|%aI|%an|%s" --name-only -- ${MODULES_DIR}/**/*.json ${MODULES_DIR}/*.json ${OLD_MODULES_DIR}/**/*.json ${OLD_MODULES_DIR}/*.json`;
    }

    // Get all commits that touched module JSON files (all locations throughout history)
    const logOutput = execSync(gitCommand, { encoding: 'utf-8' });

    const lines = logOutput.split('\n').filter((line) => line.trim());
    const commits = [];
    let currentCommit = null;

    for (const line of lines) {
      // Check if this is a commit line (contains pipe separators)
      if (line.includes('|')) {
        const [hash, date, author, message] = line.split('|');
        currentCommit = {
          hash,
          date,
          author,
          message,
          files: [],
        };
        commits.push(currentCommit);
      } else if (currentCommit && line.endsWith('.json')) {
        // This is a file path
        currentCommit.files.push(line);
      }
    }

    return commits;
  } catch (error) {
    console.error('Error getting git history:', error.message);
    return [];
  }
}

/**
 * Get the JSON diff for a specific file in a commit
 * @param {string} commitHash - The commit hash
 * @param {string} filePath - Path to the file
 * @returns {object} Object with before and after JSON, or null if parsing fails
 */
function getJsonDiff(commitHash, filePath) {
  try {
    // Get the file content before and after this commit
    let beforeContent = '';
    let afterContent = '';

    // Properly quote file path for shell (escape single quotes)
    const escapedPath = filePath.replace(/'/g, "'\\''");

    try {
      // Get content after commit (this commit)
      afterContent = execSync(`git show '${commitHash}':'${escapedPath}'`, {
        encoding: 'utf-8',
      });
    } catch (e) {
      // File might be new in this commit
      afterContent = '';
    }

    try {
      // Get content before commit (parent commit)
      beforeContent = execSync(`git show '${commitHash}~1':'${escapedPath}'`, {
        encoding: 'utf-8',
      });
    } catch (e) {
      // File might not exist in parent commit (new file)
      beforeContent = '';
    }

    let beforeJson = null;
    let afterJson = null;

    if (beforeContent) {
      try {
        beforeJson = JSON.parse(beforeContent);
      } catch (e) {
        console.warn(
          `Failed to parse JSON before commit ${commitHash} for ${filePath}`,
        );
      }
    }

    if (afterContent) {
      try {
        afterJson = JSON.parse(afterContent);
      } catch (e) {
        console.warn(
          `Failed to parse JSON after commit ${commitHash} for ${filePath}`,
        );
      }
    }

    return {
      filePath,
      before: beforeJson,
      after: afterJson,
    };
  } catch (error) {
    console.error(
      `Error getting diff for ${filePath} at ${commitHash}:`,
      error.message,
    );
    return null;
  }
}

/**
 * Extract module name from file path or JSON content
 * Prefers the `name` property from JSON content if available (handles
 * cases where filename differs from actual module name)
 * @param {string} filePath - Path like "public/modules/economy/MyModule.json"
 * @param {Object|null} jsonContent - Parsed JSON content (optional)
 * @returns {string} Module name
 */
function extractModuleName(filePath, jsonContent = null) {
  // Prefer the name property from JSON if available
  // Strip whitespace to normalize historical names that contained spaces
  if (jsonContent && jsonContent.name) {
    return jsonContent.name.replace(/\s+/g, '');
  }
  // Fallback to filename
  const fileName = path.basename(filePath, '.json');
  return fileName;
}

/**
 * Extract category from file path
 * Handles multiple historical file path patterns:
 * 1. public/modules/[category]/[name].json (current, after July 2025)
 * 2. modules/[category]/[name].json (old with category)
 * 3. modules/[name].json (old flat structure)
 * @param {string} filePath - Path like "public/modules/economy/MyModule.json"
 * @returns {string|null} Category name or null
 */
function extractCategory(filePath) {
  const parts = filePath.split('/');

  // Current structure: public/modules/[category]/[name].json
  if (parts.length >= 3 && parts[0] === 'public' && parts[1] === 'modules') {
    return parts[2];
  }

  // Old structure with category: modules/[category]/[name].json
  if (parts.length >= 3 && parts[0] === 'modules' && parts[1] !== '') {
    // Only consider it a category if it's not directly a .json file
    if (!parts[1].endsWith('.json')) {
      return parts[1];
    }
  }

  // Old flat structure: modules/[name].json
  // Try to find the module in current location to get its category
  if (
    parts.length === 2 &&
    parts[0] === 'modules' &&
    parts[1].endsWith('.json')
  ) {
    const moduleName = path.basename(filePath, '.json');
    const currentLocation = findCurrentModuleLocation(moduleName);
    if (currentLocation) {
      return extractCategory(currentLocation); // Recursive call with current path
    }
    // If module can't be found in current location, use 'unknown' category
    // This handles historical modules that have been removed or renamed
    return 'unknown';
  }

  return null;
}

/**
 * Find the current location of a module by name
 * Tries exact match first, then tries without common prefixes
 * @param {string} moduleName - Name of the module
 * @returns {string|null} Current file path or null if not found
 */
function findCurrentModuleLocation(moduleName) {
  if (!fs.existsSync(MODULES_DIR)) {
    return null;
  }

  // Read all category directories
  const categories = fs
    .readdirSync(MODULES_DIR, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

  // Try exact match first
  for (const category of categories) {
    const moduleFilePath = path.join(
      MODULES_DIR,
      category,
      `${moduleName}.json`,
    );
    if (fs.existsSync(moduleFilePath)) {
      return moduleFilePath;
    }
  }

  // Try without common prefixes (Limon_, Mad_, Trevor_, MeeBob_, R20_, etc.)
  const prefixes = [
    'Limon_',
    'Mad_',
    'Trevor_',
    'MeeBob_',
    'R20_',
    'MAD_',
    'hvb_',
  ];
  for (const prefix of prefixes) {
    if (moduleName.startsWith(prefix)) {
      const nameWithoutPrefix = moduleName.substring(prefix.length);
      for (const category of categories) {
        const moduleFilePath = path.join(
          MODULES_DIR,
          category,
          `${nameWithoutPrefix}.json`,
        );
        if (fs.existsSync(moduleFilePath)) {
          return moduleFilePath;
        }
      }
    }
  }

  // Try common name transformations
  const nameVariations = [
    moduleName.replace('7dtdStockMarket', 'StockMarket'),
    moduleName.replace('Limon_7dtdStockMarket', 'StockMarket'),
    moduleName.replace('7dtd_triviaTime', 'triviaTime'),
    moduleName.replace('enhanced-chat-bridge', 'chatbridge'),
    moduleName.replace('hvb_8ball_v2', '8ball'),
    moduleName.replace('Horde Night Warnings', 'HordeNightWarnings'),
    moduleName.replace('In Game Commands', 'CPMCommands'),
    moduleName.replace('Trivia Time', 'triviaTime'),
    moduleName.replace(' ', ''), // Remove spaces
  ];

  for (const variation of nameVariations) {
    if (variation !== moduleName) {
      for (const category of categories) {
        const moduleFilePath = path.join(
          MODULES_DIR,
          category,
          `${variation}.json`,
        );
        if (fs.existsSync(moduleFilePath)) {
          return moduleFilePath;
        }
      }
    }
  }

  return null;
}

/**
 * Main function to generate changelog data
 * @param {boolean} incremental - If true, only process new commits since last run
 */
function generateChangelogData(incremental = true) {
  console.log('Analyzing git history for module changes...');

  // Check if we should do incremental update
  let existingData = null;
  let lastCommit = null;

  if (incremental && fs.existsSync(OUTPUT_FILE)) {
    try {
      existingData = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf-8'));
      if (existingData.changes && existingData.changes.length > 0) {
        // Get the most recent commit from existing data
        lastCommit = existingData.changes[0].commitHash;
        console.log(
          `Incremental mode: Processing commits after ${lastCommit.substring(0, 7)}`,
        );
      }
    } catch (error) {
      console.warn('Could not read existing changelog data, doing full scan');
      existingData = null;
    }
  }

  const commits = getModuleCommits(lastCommit);

  if (commits.length === 0 && existingData) {
    console.log('No new commits found');
    return existingData.changes;
  }

  console.log(`Found ${commits.length} new commits affecting module files`);

  const changes = [];

  for (const commit of commits) {
    for (const filePath of commit.files) {
      console.log(
        `Processing ${filePath} from commit ${commit.hash.substring(0, 7)}...`,
      );

      const diff = getJsonDiff(commit.hash, filePath);
      if (!diff || !diff.after) {
        // Skip if we couldn't get valid JSON
        continue;
      }

      const moduleName = extractModuleName(filePath, diff.after || diff.before);
      const category = extractCategory(filePath);

      // Analyze functional changes
      const {
        analyzeFunctionalChanges,
      } = require('./analyze-functional-changes.js');
      const analysis = analyzeFunctionalChanges(
        diff.before,
        diff.after,
        moduleName,
      );

      changes.push({
        moduleName,
        category,
        commitHash: commit.hash,
        commitDate: commit.date,
        commitAuthor: commit.author,
        commitMessage: commit.message,
        filePath,
        jsonBefore: diff.before,
        jsonAfter: diff.after,
        // Add functional analysis
        functionalAnalysis: analysis,
      });
    }
  }

  console.log(`Extracted ${changes.length} new module changes`);

  // Merge with existing data if in incremental mode
  let allChanges = changes;
  if (existingData && existingData.changes) {
    allChanges = [...changes, ...existingData.changes];
    console.log(
      `Merged with ${existingData.changes.length} existing changes (total: ${allChanges.length})`,
    );
  }

  // Count changes with functional modifications
  const withFunctionalChanges = allChanges.filter(
    (c) => c.functionalAnalysis.hasChanges,
  ).length;
  console.log(`  - ${withFunctionalChanges} with functional changes`);
  console.log(
    `  - ${allChanges.length - withFunctionalChanges} formatting/non-functional changes`,
  );

  // Create data directory if it doesn't exist
  const dataDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Write raw changelog data
  fs.writeFileSync(
    OUTPUT_FILE,
    JSON.stringify(
      { changes: allChanges, generatedAt: new Date().toISOString() },
      null,
      2,
    ),
  );

  console.log(`Raw changelog data written to ${OUTPUT_FILE}`);
  console.log(`Functional analysis complete!`);

  return allChanges;
}

// Run if called directly
if (require.main === module) {
  // Check for --full flag to force full regeneration
  const isFull = process.argv.includes('--full');
  generateChangelogData(!isFull); // Pass true for incremental unless --full is specified
}

module.exports = { generateChangelogData, getModuleCommits, getJsonDiff };
