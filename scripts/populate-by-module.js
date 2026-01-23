#!/usr/bin/env node

const fs = require('fs');

// Read the raw changelog data (has all commits with functional analysis)
const rawData = JSON.parse(fs.readFileSync('data/changelog-raw.json', 'utf8'));

// Group by module - process ALL commits that have functional changes
const byModule = {};
const global = [];

rawData.changes.forEach((change) => {
  // Include changes that have functional modifications OR are new modules
  // Skip formatting/non-functional commits UNLESS it's a new module
  const isNewModule = !change.jsonBefore;
  const hasFunctionalChanges =
    change.functionalAnalysis && change.functionalAnalysis.hasChanges;

  if (!hasFunctionalChanges && !isNewModule) {
    return;
  }

  const analysis = change.functionalAnalysis || {};

  const entry = {
    moduleName: change.moduleName,
    category: change.category,
    date: change.commitDate,
    title: analysis.title || `New Module: ${change.moduleName}`,
    description:
      analysis.description || `Added ${change.moduleName} to the repository`,
    commitHash: change.commitHash,
    isNew: isNewModule,
    details: analysis.details || [],
  };

  // Add to global array
  global.push(entry);

  // Add to byModule
  if (!byModule[change.moduleName]) {
    byModule[change.moduleName] = [];
  }
  byModule[change.moduleName].push(entry);
});

// Sort global by date (newest first)
global.sort((a, b) => new Date(b.date) - new Date(a.date));

// For modules with no changelog entries, add their earliest commit
// (even if it has no functional changes) so every module has at least one entry
const modulesInRaw = {};
rawData.changes.forEach((change) => {
  if (!modulesInRaw[change.moduleName]) {
    modulesInRaw[change.moduleName] = [];
  }
  modulesInRaw[change.moduleName].push(change);
});

// Check for modules with no entries and add their earliest commit
Object.keys(modulesInRaw).forEach((moduleName) => {
  if (!byModule[moduleName] || byModule[moduleName].length === 0) {
    // Sort by date to find earliest commit
    const commits = modulesInRaw[moduleName].sort(
      (a, b) => new Date(a.commitDate) - new Date(b.commitDate),
    );
    const earliestCommit = commits[0];

    const analysis = earliestCommit.functionalAnalysis || {};
    const entry = {
      moduleName: earliestCommit.moduleName,
      category: earliestCommit.category,
      date: earliestCommit.commitDate,
      title: analysis.title || `New Module: ${earliestCommit.moduleName}`,
      description:
        analysis.description ||
        `Added ${earliestCommit.moduleName} to the repository`,
      commitHash: earliestCommit.commitHash,
      isNew: !earliestCommit.jsonBefore,
      details: analysis.details || [],
    };

    byModule[moduleName] = [entry];
    global.push(entry);
  }
});

// Sort global by date (newest first) again after adding missing modules
global.sort((a, b) => new Date(b.date) - new Date(a.date));

// Sort each module's changes by date (newest first) and deduplicate
Object.keys(byModule).forEach((moduleName) => {
  // Sort by date (newest first)
  byModule[moduleName].sort((a, b) => new Date(b.date) - new Date(a.date));

  // Deduplicate by commit hash (keep first occurrence)
  const seenCommits = new Set();
  byModule[moduleName] = byModule[moduleName].filter((change) => {
    if (seenCommits.has(change.commitHash)) {
      return false;
    }
    seenCommits.add(change.commitHash);
    return true;
  });

  // Also deduplicate by title (keep most recent, which is first after sorting)
  const seenTitles = new Set();
  byModule[moduleName] = byModule[moduleName].filter((change) => {
    if (seenTitles.has(change.title)) {
      return false;
    }
    seenTitles.add(change.title);
    return true;
  });
});

// Deduplicate global array by (moduleName + title) - keep most recent
const seenGlobal = new Set();
const deduplicatedGlobal = global.filter((change) => {
  const key = `${change.moduleName}|${change.title}`;
  if (seenGlobal.has(key)) {
    return false;
  }
  seenGlobal.add(key);
  return true;
});

// Create the changelogs object
const changelogs = {
  global: deduplicatedGlobal,
  byModule,
  generatedAt: new Date().toISOString(),
};

// Write to file
fs.writeFileSync('data/changelogs.json', JSON.stringify(changelogs, null, 2));

console.log(
  `✅ Populated byModule for ${Object.keys(byModule).length} modules`,
);

// Show stats
const modulesWithMultiple = Object.entries(byModule)
  .filter(([, changes]) => changes.length > 1)
  .sort((a, b) => b[1].length - a[1].length);

console.log(
  `\n📊 Modules with multiple changelog entries: ${modulesWithMultiple.length}`,
);
modulesWithMultiple.slice(0, 5).forEach(([name, changes]) => {
  console.log(`   ${name}: ${changes.length} changes`);
});
