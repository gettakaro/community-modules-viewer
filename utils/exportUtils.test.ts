import { describe, it, expect, vi, beforeEach } from 'vitest';
import { exportModuleAsJSON } from './exportUtils';
import { ModuleWithMeta } from '@/lib/types';

// Mock DOM APIs
const mockCreateElement = vi.fn();
const mockAppendChild = vi.fn();
const mockRemoveChild = vi.fn();
const mockCreateObjectURL = vi.fn();
const mockRevokeObjectURL = vi.fn();
const mockBlob = vi.fn();
const mockAlert = vi.fn();
const mockFetch = vi.fn() as ReturnType<typeof vi.fn>;

// Mock implementations
document.createElement = mockCreateElement as any;
if (document.body) {
  document.body.appendChild = mockAppendChild as any;
  document.body.removeChild = mockRemoveChild as any;
}

global.URL.createObjectURL = mockCreateObjectURL as any;
global.URL.revokeObjectURL = mockRevokeObjectURL as any;
global.Blob = mockBlob as any;
global.alert = mockAlert as any;
global.fetch = mockFetch as any;

// Test data
const mockCommunityModule: ModuleWithMeta = {
  name: 'test-module',
  source: 'community',
  takaroVersion: '1.0.0',
  path: '/home/user/project/public/modules/economy/test-module.json',
  versions: [
    {
      tag: 'v1.0.0',
      description: 'Test version 1',
      configSchema: '{"type": "object"}',
      uiSchema: '{"ui:order": []}',
      commands: [
        {
          name: 'test-command',
          function: 'testFunction',
          trigger: 'testTrigger',
          helpText: 'Test help',
          arguments: [],
        },
      ],
      hooks: [],
      cronJobs: [],
      permissions: [],
      functions: [],
    },
    {
      tag: 'v2.0.0',
      description: 'Test version 2',
      configSchema:
        '{"type": "object", "properties": {"key": {"type": "string"}}}',
      uiSchema: '{"key": {"ui:widget": "text"}}',
      commands: [],
      hooks: [],
      cronJobs: [],
      permissions: [],
      functions: [],
    },
  ],
};

const mockBuiltinModule: ModuleWithMeta = {
  ...mockCommunityModule,
  source: 'builtin',
  path: undefined,
};

const mockRawModuleJson = {
  name: 'test-module',
  takaroVersion: '1.0.0',
  versions: [
    {
      tag: 'v1.0.0',
      description: 'Test version 1',
      configSchema: '{"type": "object"}',
      uiSchema: '{"ui:order": []}',
      commands: [
        {
          name: 'test-command',
          function: 'testFunction',
          trigger: 'testTrigger',
          helpText: 'Test help',
          arguments: [],
        },
      ],
      hooks: [],
      cronJobs: [],
      permissions: [],
      functions: [],
    },
    {
      tag: 'v2.0.0',
      description: 'Test version 2',
      configSchema:
        '{"type": "object", "properties": {"key": {"type": "string"}}}',
      uiSchema: '{"key": {"ui:widget": "text"}}',
      commands: [],
      hooks: [],
      cronJobs: [],
      permissions: [],
      functions: [],
    },
  ],
};

beforeEach(() => {
  vi.clearAllMocks();

  // Setup default implementations
  mockCreateObjectURL.mockReturnValue('blob:mock-url');
  mockBlob.mockImplementation((content, options) => ({ content, options }));

  // Default mock element for createElement
  mockCreateElement.mockReturnValue({
    href: '',
    download: '',
    click: vi.fn(),
  });

  // Default fetch implementation
  mockFetch.mockResolvedValue({
    ok: true,
    text: () => Promise.resolve(JSON.stringify(mockRawModuleJson, null, 2)),
  } as Response);
});

describe('exportUtils', () => {
  describe('exportModuleAsJSON', () => {
    it('should show alert for built-in modules', async () => {
      await exportModuleAsJSON(mockBuiltinModule);

      expect(mockAlert).toHaveBeenCalledWith(
        "Built-in modules are already included in Takaro by default and don't need to be downloaded.",
      );
      expect(mockFetch).not.toHaveBeenCalled();
      expect(mockBlob).not.toHaveBeenCalled();
    });

    it('should show alert for modules without path', async () => {
      const moduleWithoutPath = {
        ...mockCommunityModule,
        path: undefined,
      };

      await exportModuleAsJSON(moduleWithoutPath);

      expect(mockAlert).toHaveBeenCalledWith(
        'Unable to download this module - file path not found.',
      );
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should fetch and download raw JSON for community modules', async () => {
      const mockElement = {
        href: '',
        download: '',
        click: vi.fn(),
      };
      mockCreateElement.mockReturnValue(mockElement);

      await exportModuleAsJSON(mockCommunityModule);

      // Verify fetch was called with correct URL
      expect(mockFetch).toHaveBeenCalledWith(
        '/modules/economy/test-module.json',
      );

      // Verify blob was created with raw JSON content
      expect(mockBlob).toHaveBeenCalledWith(
        [JSON.stringify(mockRawModuleJson, null, 2)],
        { type: 'application/json' },
      );

      // Verify download process
      expect(mockCreateElement).toHaveBeenCalledWith('a');
      expect(mockCreateObjectURL).toHaveBeenCalled();
      expect(mockElement.download).toBe('test-module.json');
      expect(mockElement.click).toHaveBeenCalled();
      expect(mockRemoveChild).toHaveBeenCalledWith(mockElement);
      expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
    });

    it('should extract single version when version is specified', async () => {
      const version = mockCommunityModule.versions[0];

      await exportModuleAsJSON(mockCommunityModule, version);

      // Verify the blob content contains only the specified version
      const blobCallArgs = (mockBlob as ReturnType<typeof vi.fn>).mock
        .calls[0] as [string[], object];
      const jsonContent = blobCallArgs[0][0];
      const exportedData = JSON.parse(jsonContent);

      expect(exportedData.versions).toHaveLength(1);
      expect(exportedData.versions[0].tag).toBe('v1.0.0');
      expect(exportedData.name).toBe('test-module');
    });

    it('should use custom filename when provided', async () => {
      const mockElement = {
        href: '',
        download: '',
        click: vi.fn(),
      };
      mockCreateElement.mockReturnValue(mockElement);

      await exportModuleAsJSON(
        mockCommunityModule,
        undefined,
        'custom-name.json',
      );

      expect(mockElement.download).toBe('custom-name.json');
    });

    it('should handle fetch errors gracefully', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
      } as Response);

      await exportModuleAsJSON(mockCommunityModule);

      expect(mockAlert).toHaveBeenCalledWith(
        'Failed to download module. Please try again later.',
      );
      expect(mockBlob).not.toHaveBeenCalled();
    });

    it('should handle invalid module path format', async () => {
      const moduleWithInvalidPath = {
        ...mockCommunityModule,
        path: '/invalid/path/without/modules.json',
      };

      await exportModuleAsJSON(moduleWithInvalidPath);

      expect(mockAlert).toHaveBeenCalledWith(
        'Failed to download module. Please try again later.',
      );
    });

    it('should handle nested category paths correctly', async () => {
      const moduleWithNestedPath = {
        ...mockCommunityModule,
        path: '/home/user/project/public/modules/category/subcategory/test-module.json',
      };

      await exportModuleAsJSON(moduleWithNestedPath);

      expect(mockFetch).toHaveBeenCalledWith(
        '/modules/category/subcategory/test-module.json',
      );
    });
  });
});
