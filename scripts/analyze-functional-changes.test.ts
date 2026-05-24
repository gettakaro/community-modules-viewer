import { createRequire } from 'module';
import { describe, expect, test } from 'vitest';

const require = createRequire(import.meta.url);
const { analyzeFunctionalChanges } = require('./analyze-functional-changes.js');

function moduleWithVersion(version: Record<string, unknown>) {
  return {
    versions: [
      {
        tag: 'latest',
        commands: [],
        hooks: [],
        cronJobs: [],
        functions: [],
        permissions: [],
        ...version,
      },
    ],
  };
}

describe('analyzeFunctionalChanges', () => {
  test('detects cronjob implementation updates', () => {
    const before = moduleWithVersion({
      cronJobs: [
        {
          name: 'cronJobGenerator',
          temporalValue: '*/15 * * * *',
          function: 'await oldImplementation();',
        },
      ],
    });
    const after = moduleWithVersion({
      cronJobs: [
        {
          name: 'cronJobGenerator',
          temporalValue: '*/15 * * * *',
          function: 'await newImplementation();',
        },
      ],
    });

    const analysis = analyzeFunctionalChanges(before, after, 'DynamicCronjobs');

    expect(analysis.hasChanges).toBe(true);
    expect(analysis.details).toContainEqual({
      type: 'cronjob',
      action: 'updated',
      name: 'cronJobGenerator',
    });
    expect(analysis.description).toContain('Updated 1 scheduled task');
  });

  test('detects shared function implementation updates', () => {
    const before = moduleWithVersion({
      functions: [
        {
          name: 'utils',
          function: 'export function parse() { return "old"; }',
        },
      ],
    });
    const after = moduleWithVersion({
      functions: [
        {
          name: 'utils',
          function: 'export function parse() { return "new"; }',
        },
      ],
    });

    const analysis = analyzeFunctionalChanges(before, after, 'UtilityModule');

    expect(analysis.hasChanges).toBe(true);
    expect(analysis.details).toContainEqual({
      type: 'function',
      action: 'updated',
      name: 'utils',
    });
    expect(analysis.description).toContain('Updated 1 function');
  });
});
