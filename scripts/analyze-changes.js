#!/usr/bin/env node

const fs = require('fs');
const data = JSON.parse(fs.readFileSync('data/changelog-raw.json', 'utf8'));

// Group by module and find latest change for each
const moduleMap = new Map();

data.changes.forEach((change) => {
  const existing = moduleMap.get(change.moduleName);
  if (
    !existing ||
    new Date(change.commitDate) > new Date(existing.commitDate)
  ) {
    moduleMap.set(change.moduleName, {
      moduleName: change.moduleName,
      category: change.category,
      commitDate: change.commitDate,
      commitMessage: change.commitMessage,
      isNew: change.jsonBefore === null,
      commitHash: change.commitHash,
    });
  }
});

// Sort by date (newest first)
const sorted = Array.from(moduleMap.values()).sort(
  (a, b) => new Date(b.commitDate) - new Date(a.commitDate),
);

console.log('Recent Module Changes (newest first):\n');
sorted.slice(0, 15).forEach((m, i) => {
  const type = m.isNew ? '[NEW]' : '[UPD]';
  const date = new Date(m.commitDate).toISOString().split('T')[0];
  console.log(`${i + 1}. ${type} ${m.moduleName} (${m.category}) - ${date}`);
  console.log(`   ${m.commitMessage}`);
});

console.log(`\n\nTotal: ${sorted.length} unique modules changed`);
console.log(`New modules: ${sorted.filter((m) => m.isNew).length}`);
console.log(`Updated modules: ${sorted.filter((m) => !m.isNew).length}`);
