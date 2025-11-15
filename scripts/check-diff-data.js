#!/usr/bin/env node

const fs = require('fs');
const raw = JSON.parse(fs.readFileSync('data/changelog-raw.json', 'utf8'));

// Pick a module change that has both before and after
const changeWithDiff = raw.changes.find(
  (c) => c.jsonBefore !== null && c.jsonAfter !== null,
);

if (!changeWithDiff) {
  console.log('No changes found with both before and after data');
  process.exit(0);
}

console.log('Sample change:', changeWithDiff.moduleName);
console.log('Commit:', changeWithDiff.commitMessage);
console.log('\nData available:');
console.log('- Has before JSON:', changeWithDiff.jsonBefore !== null);
console.log('- Has after JSON:', changeWithDiff.jsonAfter !== null);

if (changeWithDiff.jsonBefore && changeWithDiff.jsonAfter) {
  const before = changeWithDiff.jsonBefore;
  const after = changeWithDiff.jsonAfter;

  // Check if versions array exists
  const beforeVersion = before.versions?.[0];
  const afterVersion = after.versions?.[0];

  if (beforeVersion && afterVersion) {
    console.log('\nFunctional changes we CAN detect:');
    console.log(
      'Commands:',
      beforeVersion.commands?.length || 0,
      '->',
      afterVersion.commands?.length || 0,
    );
    console.log(
      'Hooks:',
      beforeVersion.hooks?.length || 0,
      '->',
      afterVersion.hooks?.length || 0,
    );
    console.log(
      'Cron Jobs:',
      beforeVersion.cronJobs?.length || 0,
      '->',
      afterVersion.cronJobs?.length || 0,
    );
    console.log(
      'Functions:',
      beforeVersion.functions?.length || 0,
      '->',
      afterVersion.functions?.length || 0,
    );
    console.log(
      'Permissions:',
      beforeVersion.permissions?.length || 0,
      '->',
      afterVersion.permissions?.length || 0,
    );

    // Show specific changes
    if (afterVersion.commands?.length > beforeVersion.commands?.length) {
      console.log('\n✅ NEW COMMANDS ADDED:');
      const beforeCmdNames = beforeVersion.commands?.map((c) => c.name) || [];
      const newCommands = afterVersion.commands?.filter(
        (c) => !beforeCmdNames.includes(c.name),
      );
      newCommands?.forEach((cmd) => console.log(`  - ${cmd.name}`));
    }

    if (afterVersion.hooks?.length > beforeVersion.hooks?.length) {
      console.log('\n✅ NEW HOOKS ADDED:');
      const beforeHookNames = beforeVersion.hooks?.map((h) => h.name) || [];
      const newHooks = afterVersion.hooks?.filter(
        (h) => !beforeHookNames.includes(h.name),
      );
      newHooks?.forEach((hook) => console.log(`  - ${hook.name}`));
    }
  }
}

console.log('\n\n🤔 CURRENT IMPLEMENTATION:');
console.log('- We HAVE the before/after JSON data');
console.log('- We CAN detect specific functional changes');
console.log('- But we are NOT currently analyzing it!');
console.log('- The AI descriptions are generic, not specific to what changed');
