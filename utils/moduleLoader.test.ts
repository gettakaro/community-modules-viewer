import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { normalizeModules } from './moduleLoader';
import { ModuleWithMeta } from '@/lib/types';

// Since the fs operations are complex to mock properly and many functions
// depend on filesystem structure, we'll focus on testing the pure functions
// that can be tested in isolation

describe('moduleLoader', () => {
  describe('normalizeModules', () => {
    it('should normalize modules with missing fields by providing defaults', () => {
      const moduleWithMissingFields: ModuleWithMeta = {
        name: 'test-module',
        source: 'community',
        takaroVersion: '1.0.0',
        path: '/path/to/module.json',
        versions: [
          {
            tag: 'v1.0.0',
            // Missing optional fields to test defaults
          } as any,
        ],
      };

      const normalized = normalizeModules([moduleWithMissingFields]);

      expect(normalized).toHaveLength(1);
      expect(normalized[0].versions[0]).toMatchObject({
        tag: 'v1.0.0',
        description: '',
        configSchema: '{}',
        uiSchema: '{}',
        commands: [],
        hooks: [],
        cronJobs: [],
        functions: [],
        permissions: [],
      });
    });

    it('should preserve existing values when fields are present', () => {
      const moduleWithValues: ModuleWithMeta = {
        name: 'test-module',
        source: 'community',
        takaroVersion: '1.0.0',
        path: '/path/to/module.json',
        versions: [
          {
            tag: 'v1.0.0',
            description: 'Test description',
            configSchema: '{"type": "object"}',
            uiSchema: '{"ui:order": ["name"]}',
            commands: [
              {
                name: 'test-command',
                function: 'testFunction',
                trigger: 'testTrigger',
                helpText: 'Test help',
                arguments: [],
              },
            ],
            hooks: [
              {
                name: 'test-hook',
                function: 'testHookFunction',
                eventType: 'player.join',
              },
            ],
            cronJobs: [
              {
                name: 'test-cron',
                function: 'testCronFunction',
                temporalValue: '0 0 * * *',
              },
            ],
            functions: [
              {
                name: 'testFunction',
                function: 'console.log("test")',
              },
            ],
            permissions: [],
          },
        ],
      };

      const normalized = normalizeModules([moduleWithValues]);

      expect(normalized[0].versions[0]).toMatchObject({
        tag: 'v1.0.0',
        description: 'Test description',
        configSchema: '{"type": "object"}',
        uiSchema: '{"ui:order": ["name"]}',
        commands: [
          {
            name: 'test-command',
            function: 'testFunction',
            trigger: 'testTrigger',
            helpText: 'Test help',
            arguments: [],
          },
        ],
        hooks: [
          {
            name: 'test-hook',
            function: 'testHookFunction',
            eventType: 'player.join',
          },
        ],
        cronJobs: [
          {
            name: 'test-cron',
            function: 'testCronFunction',
            temporalValue: '0 0 * * *',
          },
        ],
        functions: [
          {
            name: 'testFunction',
            function: 'console.log("test")',
          },
        ],
        permissions: [],
      });
    });

    it('should handle multiple modules with mixed field completeness', () => {
      const modules: ModuleWithMeta[] = [
        {
          name: 'complete-module',
          source: 'builtin',
          takaroVersion: '1.0.0',
          path: '/path/to/complete.json',
          versions: [
            {
              tag: 'v1.0.0',
              description: 'Complete module',
              configSchema: '{"type": "object"}',
              uiSchema: '{}',
              commands: [{ name: 'cmd' } as any],
              hooks: [],
              cronJobs: [],
              functions: [],
              permissions: [],
            },
          ],
        },
        {
          name: 'incomplete-module',
          source: 'community',
          takaroVersion: '1.0.0',
          path: '/path/to/incomplete.json',
          versions: [
            {
              tag: 'v2.0.0',
              // Missing most fields
            } as any,
          ],
        },
      ];

      const normalized = normalizeModules(modules);

      expect(normalized).toHaveLength(2);

      // Complete module should remain unchanged
      expect(normalized[0].versions[0]).toMatchObject({
        description: 'Complete module',
        configSchema: '{"type": "object"}',
        commands: [{ name: 'cmd' }],
      });

      // Incomplete module should get defaults
      expect(normalized[1].versions[0]).toMatchObject({
        tag: 'v2.0.0',
        description: '',
        configSchema: '{}',
        uiSchema: '{}',
        commands: [],
        hooks: [],
        cronJobs: [],
        functions: [],
        permissions: [],
      });
    });

    it('should handle modules with empty versions array', () => {
      const moduleWithNoVersions: ModuleWithMeta = {
        name: 'no-versions',
        source: 'community',
        takaroVersion: '1.0.0',
        path: '/path/to/module.json',
        versions: [],
      };

      const normalized = normalizeModules([moduleWithNoVersions]);

      expect(normalized).toHaveLength(1);
      expect(normalized[0].versions).toEqual([]);
    });

    it('should handle modules with undefined versions gracefully', () => {
      const moduleWithUndefinedVersions: ModuleWithMeta = {
        name: 'undefined-versions',
        source: 'community',
        takaroVersion: '1.0.0',
        path: '/path/to/module.json',
        versions: undefined as any,
      };

      const normalized = normalizeModules([moduleWithUndefinedVersions]);

      expect(normalized).toHaveLength(1);
      expect(normalized[0].versions).toEqual([]);
    });

    it('should preserve module metadata during normalization', () => {
      const originalModule: ModuleWithMeta = {
        name: 'test-module',
        source: 'builtin',
        takaroVersion: '2.1.0',
        path: '/custom/path/module.json',
        versions: [
          {
            tag: 'v1.0.0',
          } as any,
        ],
      };

      const normalized = normalizeModules([originalModule]);

      expect(normalized[0]).toMatchObject({
        name: 'test-module',
        source: 'builtin',
        takaroVersion: '2.1.0',
        path: '/custom/path/module.json',
      });
    });

    it('should handle multiple versions in a single module', () => {
      const moduleWithMultipleVersions: ModuleWithMeta = {
        name: 'multi-version',
        source: 'community',
        takaroVersion: '1.0.0',
        path: '/path/to/module.json',
        versions: [
          {
            tag: 'v1.0.0',
            description: 'Version 1',
            commands: [{ name: 'cmd1' } as any],
          } as any,
          {
            tag: 'v2.0.0',
            // Missing fields
          } as any,
          {
            tag: 'v3.0.0',
            description: 'Version 3',
            configSchema: '{"type": "object"}',
          } as any,
        ],
      };

      const normalized = normalizeModules([moduleWithMultipleVersions]);

      expect(normalized[0].versions).toHaveLength(3);

      // First version should preserve existing values and fill defaults
      expect(normalized[0].versions[0]).toMatchObject({
        tag: 'v1.0.0',
        description: 'Version 1',
        commands: [{ name: 'cmd1' }],
        hooks: [],
        cronJobs: [],
      });

      // Second version should get all defaults
      expect(normalized[0].versions[1]).toMatchObject({
        tag: 'v2.0.0',
        description: '',
        configSchema: '{}',
        commands: [],
      });

      // Third version should preserve some values and default others
      expect(normalized[0].versions[2]).toMatchObject({
        tag: 'v3.0.0',
        description: 'Version 3',
        configSchema: '{"type": "object"}',
        uiSchema: '{}',
        commands: [],
      });
    });
  });
});
