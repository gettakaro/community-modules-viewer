import {
  describe,
  it,
  expect,
  jest,
  beforeEach,
  afterEach,
} from '@jest/globals';
import { exportModuleAsJSON } from './exportUtils';
import { ModuleWithMeta } from '@/lib/types';

// Mock DOM APIs
const mockCreateElement = jest.fn();
const mockAppendChild = jest.fn();
const mockRemoveChild = jest.fn();
const mockCreateObjectURL = jest.fn();
const mockRevokeObjectURL = jest.fn();
const mockBlob = jest.fn();

// Mock implementations
document.createElement = mockCreateElement as any;
if (document.body) {
  document.body.appendChild = mockAppendChild as any;
  document.body.removeChild = mockRemoveChild as any;
}

global.URL.createObjectURL = mockCreateObjectURL as any;
global.URL.revokeObjectURL = mockRevokeObjectURL as any;
global.Blob = mockBlob as any;

// Test data
const mockModule: ModuleWithMeta = {
  name: 'test-module',
  source: 'community',
  takaroVersion: '1.0.0',
  path: '/path/to/module.json',
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
  jest.clearAllMocks();

  // Setup default implementations
  mockCreateObjectURL.mockReturnValue('blob:mock-url');
  mockBlob.mockImplementation((content, options) => ({ content, options }));

  // Default mock element for createElement
  mockCreateElement.mockReturnValue({
    href: '',
    download: '',
    click: jest.fn(),
  });
});

describe('exportUtils', () => {
  describe('exportModuleAsJSON', () => {
    it('should create blob with JSON content for single version', () => {
      const version = mockModule.versions[0];

      exportModuleAsJSON(mockModule, version);

      // Verify Blob was called
      expect(mockBlob).toHaveBeenCalledWith([expect.any(String)], {
        type: 'application/json',
      });

      // Get the JSON content and verify structure
      const blobCallArgs = (mockBlob as jest.Mock).mock.calls[0] as [string[], object];
      const jsonContent = blobCallArgs[0][0];
      const exportedData = JSON.parse(jsonContent);

      expect(exportedData).toEqual({
        name: 'test-module',
        source: 'community',
        takaroVersion: '1.0.0',
        version: 'v1.0.0',
        description: 'Test version 1',
        configSchema: '{"type": "object"}',
        uiSchema: '{"ui:order": []}',
        commands: version.commands,
        hooks: [],
        cronJobs: [],
        permissions: [],
      });
    });

    it('should create blob with JSON content for all versions', () => {
      exportModuleAsJSON(mockModule);

      // Verify Blob was called
      expect(mockBlob).toHaveBeenCalledWith([expect.any(String)], {
        type: 'application/json',
      });

      // Get the JSON content and verify structure
      const blobCallArgs = (mockBlob as jest.Mock).mock.calls[0] as [string[], object];
      const jsonContent = blobCallArgs[0][0];
      const exportedData = JSON.parse(jsonContent);

      expect(exportedData).toEqual({
        name: 'test-module',
        source: 'community',
        takaroVersion: '1.0.0',
        versions: [
          {
            tag: 'v1.0.0',
            description: 'Test version 1',
            configSchema: '{"type": "object"}',
            uiSchema: '{"ui:order": []}',
            commands: mockModule.versions[0].commands,
            hooks: [],
            cronJobs: [],
            permissions: [],
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
          },
        ],
      });
    });

    it('should trigger DOM download process', () => {
      const mockElement = {
        href: '',
        download: '',
        click: jest.fn(),
      };

      mockCreateElement.mockReturnValue(mockElement);

      exportModuleAsJSON(mockModule);

      // Verify the download process
      expect(mockCreateElement).toHaveBeenCalledWith('a');
      expect(mockCreateObjectURL).toHaveBeenCalled();
      expect(mockAppendChild).toHaveBeenCalledWith(mockElement);
      expect(mockElement.click).toHaveBeenCalled();
      expect(mockRemoveChild).toHaveBeenCalledWith(mockElement);
      expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
    });

    it('should format JSON with proper indentation', () => {
      exportModuleAsJSON(mockModule);

      const blobCallArgs = (mockBlob as jest.Mock).mock.calls[0] as [string[], object];
      const jsonContent = blobCallArgs[0][0];

      // Verify the JSON is pretty-formatted
      expect(jsonContent).toMatch(/\n/);
      expect(jsonContent).toMatch(/  /); // Should contain indentation

      // Verify it's valid JSON
      expect(() => JSON.parse(jsonContent)).not.toThrow();
    });

    it('should handle modules with empty arrays correctly', () => {
      const moduleWithEmptyArrays: ModuleWithMeta = {
        ...mockModule,
        versions: [
          {
            tag: 'v1.0.0',
            description: 'Empty arrays test',
            configSchema: '{}',
            uiSchema: '{}',
            commands: [],
            hooks: [],
            cronJobs: [],
            permissions: [],
            functions: [],
          },
        ],
      };

      exportModuleAsJSON(moduleWithEmptyArrays);

      const blobCallArgs = (mockBlob as jest.Mock).mock.calls[0] as [string[], object];
      const jsonContent = blobCallArgs[0][0];
      const exportedData = JSON.parse(jsonContent);

      expect(exportedData.versions).toHaveLength(1);
      expect(exportedData.versions[0].commands).toEqual([]);
      expect(exportedData.versions[0].hooks).toEqual([]);
      expect(exportedData.versions[0].cronJobs).toEqual([]);
      expect(exportedData.versions[0].permissions).toEqual([]);
    });
  });
});
