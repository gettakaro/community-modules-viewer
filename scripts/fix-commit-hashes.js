#!/usr/bin/env node

const fs = require('fs');

const raw = JSON.parse(fs.readFileSync('data/changelog-raw.json', 'utf8'));
const changelogs = JSON.parse(fs.readFileSync('data/changelogs.json', 'utf8'));

// Fix global entries by matching with raw commits
// Match by module name AND partial hash (first 8 chars)
let fixed = 0;
changelogs.global = changelogs.global.map((entry) => {
  // Try to find matching commit by partial hash
  const shortHash = entry.commitHash.substring(0, 8);
  const match = raw.changes.find(
    (c) =>
      c.moduleName === entry.moduleName && c.commitHash.startsWith(shortHash),
  );

  if (match && entry.commitHash !== match.commitHash) {
    console.log(`Fixing ${entry.moduleName}:`);
    console.log(`  Old: ${entry.commitHash}`);
    console.log(`  New: ${match.commitHash}`);
    entry.commitHash = match.commitHash;
    entry.date = match.commitDate;
    fixed++;
  } else if (!match) {
    console.log(`⚠️  No match found for ${entry.moduleName} (${shortHash})`);
  }

  return entry;
});

fs.writeFileSync('data/changelogs.json', JSON.stringify(changelogs, null, 2));
console.log(`\n✅ Fixed ${fixed} commit hashes`);
