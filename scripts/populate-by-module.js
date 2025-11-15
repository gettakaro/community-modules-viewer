#!/usr/bin/env node

const fs = require('fs');

// Read the raw changelog data (has all commits with functional analysis)
const rawData = JSON.parse(fs.readFileSync('data/changelog-raw.json', 'utf8'));

// Group by module - process ALL commits that have functional changes
const byModule = {};
const global = [];

rawData.changes.forEach((change) => {
  // ONLY include changes that have functional modifications
  // Skip formatting/non-functional commits
  if (!change.functionalAnalysis || !change.functionalAnalysis.hasChanges) {
    return;
  }

  const analysis = change.functionalAnalysis;

  const entry = {
    moduleName: change.moduleName,
    category: change.category,
    date: change.commitDate,
    title: analysis.title,
    description: analysis.description,
    commitHash: change.commitHash,
    isNew: !change.jsonBefore,
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

// Sort each module's changes by date (newest first) and deduplicate
Object.keys(byModule).forEach((moduleName) => {
  // Sort by date
  byModule[moduleName].sort((a, b) => new Date(b.date) - new Date(a.date));

  // Deduplicate by commit hash (keep first occurrence)
  const seen = new Set();
  byModule[moduleName] = byModule[moduleName].filter((change) => {
    if (seen.has(change.commitHash)) {
      return false;
    }
    seen.add(change.commitHash);
    return true;
  });
});

// Create the changelogs object
const changelogs = {
  global,
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
  .filter(([name, changes]) => changes.length > 1)
  .sort((a, b) => b[1].length - a[1].length);

console.log(
  `\n📊 Modules with multiple changelog entries: ${modulesWithMultiple.length}`,
);
modulesWithMultiple.slice(0, 5).forEach(([name, changes]) => {
  console.log(`   ${name}: ${changes.length} changes`);
});
