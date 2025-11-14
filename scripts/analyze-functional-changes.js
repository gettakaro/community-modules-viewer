#!/usr/bin/env node

/**
 * Analyzes functional changes in module JSON diffs
 * Detects specific changes to commands, hooks, cron jobs, functions, permissions, and config
 */

const fs = require('fs');

/**
 * Analyze changes between two versions of a module
 */
function analyzeFunctionalChanges(before, after, moduleName) {
  const changes = {
    hasChanges: false,
    title: '',
    description: '',
    details: []
  };

  // For new modules, create empty "before" structure so we can analyze what was added
  const isNewModule = !before;
  if (!before) {
    before = { versions: [{}] };
  }

  const beforeVersion = before.versions?.[0] || {};
  const afterVersion = after.versions?.[0] || {};

  // Analyze each component type
  const commandChanges = analyzeCommands(beforeVersion.commands || [], afterVersion.commands || []);
  const hookChanges = analyzeHooks(beforeVersion.hooks || [], afterVersion.hooks || []);
  const cronChanges = analyzeCronJobs(beforeVersion.cronJobs || [], afterVersion.cronJobs || []);
  const functionChanges = analyzeFunctions(beforeVersion.functions || [], afterVersion.functions || []);
  const permissionChanges = analyzePermissions(beforeVersion.permissions || [], afterVersion.permissions || []);
  const configChanges = analyzeConfig(beforeVersion.configSchema, afterVersion.configSchema);
  const versionChanges = analyzeVersionTag(beforeVersion.tag, afterVersion.tag);

  // Collect all changes
  const allChanges = [
    ...commandChanges,
    ...hookChanges,
    ...cronChanges,
    ...functionChanges,
    ...permissionChanges,
    ...configChanges,
    ...versionChanges
  ];

  if (allChanges.length === 0) {
    // No functional changes detected
    return changes;
  }

  changes.hasChanges = true;
  changes.details = allChanges;

  // Generate title based on primary change type
  if (isNewModule) {
    // For new modules, use "New Module" title
    changes.title = `New Module: ${moduleName}`;
  } else if (commandChanges.length > 0) {
    changes.title = commandChanges.length === 1
      ? `Command Update: ${commandChanges[0].name}`
      : `Updated ${commandChanges.length} Commands`;
  } else if (hookChanges.length > 0) {
    changes.title = hookChanges.length === 1
      ? `Hook Update: ${hookChanges[0].name}`
      : `Updated ${hookChanges.length} Hooks`;
  } else if (configChanges.length > 0) {
    changes.title = 'Configuration Updated';
  } else {
    changes.title = 'Module Updated';
  }

  // Generate user-friendly description
  changes.description = generateDescription(allChanges);

  return changes;
}

function analyzeCommands(before, after) {
  const changes = [];
  const beforeNames = before.map(c => c.name);
  const afterNames = after.map(c => c.name);

  // Added commands
  after.forEach(cmd => {
    if (!beforeNames.includes(cmd.name)) {
      changes.push({
        type: 'command',
        action: 'added',
        name: cmd.name,
        description: cmd.helpText || 'New command added'
      });
    }
  });

  // Removed commands
  before.forEach(cmd => {
    if (!afterNames.includes(cmd.name)) {
      changes.push({
        type: 'command',
        action: 'removed',
        name: cmd.name
      });
    }
  });

  return changes;
}

function analyzeHooks(before, after) {
  const changes = [];
  const beforeNames = before.map(h => h.name);
  const afterNames = after.map(h => h.name);

  // Added hooks
  after.forEach(hook => {
    if (!beforeNames.includes(hook.name)) {
      changes.push({
        type: 'hook',
        action: 'added',
        name: hook.name,
        eventType: hook.eventType || 'unknown'
      });
    }
  });

  // Removed hooks
  before.forEach(hook => {
    if (!afterNames.includes(hook.name)) {
      changes.push({
        type: 'hook',
        action: 'removed',
        name: hook.name
      });
    }
  });

  return changes;
}

function analyzeCronJobs(before, after) {
  const changes = [];
  const beforeNames = before.map(c => c.name);
  const afterNames = after.map(c => c.name);

  // Added cron jobs
  after.forEach(cron => {
    if (!beforeNames.includes(cron.name)) {
      changes.push({
        type: 'cronjob',
        action: 'added',
        name: cron.name,
        schedule: cron.temporalValue || 'scheduled'
      });
    }
  });

  // Removed cron jobs
  before.forEach(cron => {
    if (!afterNames.includes(cron.name)) {
      changes.push({
        type: 'cronjob',
        action: 'removed',
        name: cron.name
      });
    }
  });

  return changes;
}

function analyzeFunctions(before, after) {
  const changes = [];
  const beforeNames = before.map(f => f.name);
  const afterNames = after.map(f => f.name);

  // Added functions
  after.forEach(func => {
    if (!beforeNames.includes(func.name)) {
      changes.push({
        type: 'function',
        action: 'added',
        name: func.name
      });
    }
  });

  // Removed functions
  before.forEach(func => {
    if (!afterNames.includes(func.name)) {
      changes.push({
        type: 'function',
        action: 'removed',
        name: func.name
      });
    }
  });

  return changes;
}

function analyzePermissions(before, after) {
  const changes = [];
  const beforePerms = before.map(p => p.permission);
  const afterPerms = after.map(p => p.permission);

  // Added permissions
  after.forEach(perm => {
    if (!beforePerms.includes(perm.permission)) {
      changes.push({
        type: 'permission',
        action: 'added',
        name: perm.permission,
        description: perm.description
      });
    }
  });

  // Removed permissions
  before.forEach(perm => {
    if (!afterPerms.includes(perm.permission)) {
      changes.push({
        type: 'permission',
        action: 'removed',
        name: perm.permission
      });
    }
  });

  return changes;
}

function analyzeConfig(beforeSchema, afterSchema) {
  const changes = [];

  try {
    const before = beforeSchema ? JSON.parse(beforeSchema) : {};
    const after = afterSchema ? JSON.parse(afterSchema) : {};

    const beforeProps = Object.keys(before.properties || {});
    const afterProps = Object.keys(after.properties || {});

    // Added config fields
    afterProps.forEach(prop => {
      if (!beforeProps.includes(prop)) {
        const field = after.properties[prop];
        changes.push({
          type: 'config',
          action: 'added',
          name: prop,
          fieldType: field.type,
          description: field.description || field.title
        });
      }
    });

    // Removed config fields
    beforeProps.forEach(prop => {
      if (!afterProps.includes(prop)) {
        changes.push({
          type: 'config',
          action: 'removed',
          name: prop
        });
      }
    });
  } catch (e) {
    // Ignore JSON parse errors
  }

  return changes;
}

function analyzeVersionTag(beforeTag, afterTag) {
  const changes = [];

  // Check if version tag changed
  if (beforeTag !== afterTag && afterTag) {
    changes.push({
      type: 'version',
      action: 'updated',
      name: afterTag,
      previousVersion: beforeTag || 'initial'
    });
  }

  return changes;
}

function generateDescription(allChanges) {
  const parts = [];

  // Group by type and action
  const added = allChanges.filter(c => c.action === 'added');
  const removed = allChanges.filter(c => c.action === 'removed');
  const updated = allChanges.filter(c => c.action === 'updated');

  if (added.length > 0) {
    const byType = {};
    added.forEach(change => {
      byType[change.type] = byType[change.type] || [];
      byType[change.type].push(change);
    });

    Object.entries(byType).forEach(([type, items]) => {
      if (type === 'command') {
        parts.push(`Added ${items.length} command${items.length > 1 ? 's' : ''}: ${items.map(i => `\`${i.name}\``).join(', ')}`);
      } else if (type === 'hook') {
        parts.push(`Added ${items.length} hook${items.length > 1 ? 's' : ''}: ${items.map(i => `\`${i.name}\` (${i.eventType})`).join(', ')}`);
      } else if (type === 'config') {
        parts.push(`New configuration option${items.length > 1 ? 's' : ''}: ${items.map(i => `\`${i.name}\``).join(', ')}`);
      } else if (type === 'cronjob') {
        parts.push(`Added ${items.length} scheduled task${items.length > 1 ? 's' : ''}: ${items.map(i => `\`${i.name}\``).join(', ')}`);
      } else if (type === 'function') {
        parts.push(`Added ${items.length} function${items.length > 1 ? 's' : ''}: ${items.map(i => `\`${i.name}\``).join(', ')}`);
      } else if (type === 'permission') {
        parts.push(`New permission${items.length > 1 ? 's' : ''}: ${items.map(i => `\`${i.name}\``).join(', ')}`);
      }
    });
  }

  if (removed.length > 0) {
    const byType = {};
    removed.forEach(change => {
      byType[change.type] = byType[change.type] || [];
      byType[change.type].push(change);
    });

    Object.entries(byType).forEach(([type, items]) => {
      if (type === 'command') {
        parts.push(`Removed ${items.length} command${items.length > 1 ? 's' : ''}: ${items.map(i => `\`${i.name}\``).join(', ')}`);
      } else if (type === 'hook') {
        parts.push(`Removed ${items.length} hook${items.length > 1 ? 's' : ''}: ${items.map(i => `\`${i.name}\``).join(', ')}`);
      } else if (type === 'config') {
        parts.push(`Removed configuration option${items.length > 1 ? 's' : ''}: ${items.map(i => `\`${i.name}\``).join(', ')}`);
      }
    });
  }

  // Handle updated items (like version changes)
  if (updated.length > 0) {
    updated.forEach(change => {
      if (change.type === 'version') {
        parts.unshift(`Updated to version ${change.name}`);
      }
    });
  }

  if (parts.length === 0) {
    return 'Module updated with improvements and fixes.';
  }

  return parts.join('. ') + '.';
}

// Export for use in other scripts
module.exports = { analyzeFunctionalChanges };

// Run if called directly
if (require.main === module) {
  const raw = JSON.parse(fs.readFileSync('data/changelog-raw.json', 'utf8'));

  console.log('Analyzing functional changes...\n');

  let totalChanges = 0;
  let changesWithFunctionality = 0;

  raw.changes.slice(0, 5).forEach(change => {
    const analysis = analyzeFunctionalChanges(change.jsonBefore, change.jsonAfter, change.moduleName);

    totalChanges++;
    if (analysis.hasChanges) {
      changesWithFunctionality++;
      console.log(`${change.moduleName}:`);
      console.log(`  Title: ${analysis.title}`);
      console.log(`  Description: ${analysis.description}`);
      console.log(`  Details: ${analysis.details.length} changes detected\n`);
    }
  });

  console.log(`\nAnalyzed ${totalChanges} changes`);
  console.log(`Found ${changesWithFunctionality} with functional changes`);
}
