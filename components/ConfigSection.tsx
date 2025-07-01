'use client';

import { CollapsibleCode } from './CollapsibleCode';

export interface ConfigSectionProps {
  /** JSON schema for configuration as a string */
  configSchema: string;
  /** UI schema for configuration form as a string */
  uiSchema: string;
  /** Additional CSS classes */
  className?: string;
  /** Whether to show schemas expanded by default */
  defaultExpanded?: boolean;
}

/**
 * ConfigSection component for displaying module configuration schemas
 * Shows both JSON schema and UI schema using CollapsibleCode components
 * Handles JSON parsing errors gracefully with user-friendly error messages
 */
export function ConfigSection({
  configSchema,
  uiSchema,
  className = '',
  defaultExpanded = false,
}: ConfigSectionProps) {
  /**
   * Safely parse JSON string and format it for display
   * @param jsonString - JSON string to parse and format
   * @param fallback - Fallback value if parsing fails
   * @returns Formatted JSON string or fallback
   */
  const safeParseAndFormat = (jsonString: string, fallback = '{}'): string => {
    try {
      // Handle empty or whitespace-only strings
      if (!jsonString || jsonString.trim() === '') {
        return JSON.stringify({}, null, 2);
      }

      const parsed = JSON.parse(jsonString);
      return JSON.stringify(parsed, null, 2);
    } catch (error) {
      console.warn('Failed to parse JSON schema:', error);
      return fallback;
    }
  };

  /**
   * Check if JSON schema is effectively empty
   * @param jsonString - JSON string to check
   * @returns True if schema is empty or only contains empty object
   */
  const isEmptySchema = (jsonString: string): boolean => {
    try {
      if (!jsonString || jsonString.trim() === '') {
        return true;
      }

      const parsed = JSON.parse(jsonString);

      // Check if it's an empty object or only contains empty/default properties
      if (typeof parsed === 'object' && parsed !== null) {
        const keys = Object.keys(parsed);
        return (
          keys.length === 0 ||
          (keys.length === 1 && keys[0] === 'type' && parsed.type === 'object')
        );
      }

      return false;
    } catch {
      return false; // If it can't be parsed, it's not empty (it's invalid)
    }
  };

  /**
   * Validate if a JSON string is valid
   * @param jsonString - JSON string to validate
   * @returns Object with validation result and error message
   */
  const validateJson = (
    jsonString: string,
  ): { isValid: boolean; error?: string } => {
    try {
      if (!jsonString || jsonString.trim() === '') {
        return { isValid: true }; // Empty is considered valid (will use default)
      }

      JSON.parse(jsonString);
      return { isValid: true };
    } catch (error) {
      return {
        isValid: false,
        error: error instanceof Error ? error.message : 'Invalid JSON format',
      };
    }
  };

  const configValidation = validateJson(configSchema);
  const uiValidation = validateJson(uiSchema);

  const isConfigEmpty = isEmptySchema(configSchema);
  const isUiEmpty = isEmptySchema(uiSchema);

  const formattedConfigSchema = safeParseAndFormat(configSchema);
  const formattedUiSchema = safeParseAndFormat(uiSchema);

  // If both schemas are empty, show a helpful empty state
  if (isConfigEmpty && isUiEmpty) {
    return (
      <section
        className={`space-y-4 ${className}`}
        aria-labelledby="config-section-title"
      >
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-takaro-card mb-4">
            <svg
              className="w-6 h-6 text-takaro-text-muted"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-takaro-text-primary mb-2">
            No Configuration Required
          </h3>
          <p className="text-takaro-text-secondary text-sm max-w-md mx-auto">
            This module doesn't require any configuration. You can install and
            use it right away without any setup.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      className={`space-y-6 ${className}`}
      aria-labelledby="config-section-title"
    >
      <div className="space-y-4">
        <h2
          id="config-section-title"
          className="text-xl font-semibold text-takaro-text-primary border-b border-takaro-border pb-2"
        >
          Configuration
        </h2>
        <p className="text-takaro-text-secondary text-sm">
          Configure this module using the schemas below. The JSON schema defines
          the data structure, while the UI schema customizes how the
          configuration form is displayed.
        </p>
      </div>

      {/* Configuration Schema */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-takaro-text-primary">
            Configuration Schema
          </h3>
          {!configValidation.isValid && (
            <span className="badge-takaro-error text-xs">Invalid JSON</span>
          )}
        </div>

        {!configValidation.isValid ? (
          <div className="card-takaro bg-takaro-error/10 border-takaro-error/20">
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-takaro-error flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <h4 className="font-medium text-takaro-error mb-1">
                  Configuration Schema Error
                </h4>
                <p className="text-sm text-takaro-text-secondary">
                  {configValidation.error}
                </p>
                <details className="mt-2">
                  <summary className="text-sm text-takaro-text-muted cursor-pointer hover:text-takaro-text-secondary">
                    Show raw content
                  </summary>
                  <pre className="mt-2 text-xs bg-takaro-card p-2 rounded border overflow-auto">
                    {configSchema}
                  </pre>
                </details>
              </div>
            </div>
          </div>
        ) : isConfigEmpty ? (
          <div className="card-takaro bg-takaro-card">
            <div className="flex items-center gap-3 text-takaro-text-muted">
              <svg
                className="w-5 h-5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-sm">
                No configuration schema defined. This module uses default
                configuration.
              </p>
            </div>
          </div>
        ) : (
          <CollapsibleCode
            code={formattedConfigSchema}
            language="json"
            title="JSON Schema"
            defaultExpanded={defaultExpanded}
            showCopy={true}
            className="bg-takaro-card border border-takaro-border"
          />
        )}
      </div>

      {/* UI Schema */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-takaro-text-primary">
            UI Schema
          </h3>
          {!uiValidation.isValid && (
            <span className="badge-takaro-error text-xs">Invalid JSON</span>
          )}
        </div>

        {!uiValidation.isValid ? (
          <div className="card-takaro bg-takaro-error/10 border-takaro-error/20">
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-takaro-error flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <h4 className="font-medium text-takaro-error mb-1">
                  UI Schema Error
                </h4>
                <p className="text-sm text-takaro-text-secondary">
                  {uiValidation.error}
                </p>
                <details className="mt-2">
                  <summary className="text-sm text-takaro-text-muted cursor-pointer hover:text-takaro-text-secondary">
                    Show raw content
                  </summary>
                  <pre className="mt-2 text-xs bg-takaro-card p-2 rounded border overflow-auto">
                    {uiSchema}
                  </pre>
                </details>
              </div>
            </div>
          </div>
        ) : isUiEmpty ? (
          <div className="card-takaro bg-takaro-card">
            <div className="flex items-center gap-3 text-takaro-text-muted">
              <svg
                className="w-5 h-5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-sm">
                No UI schema defined. Configuration form will use default
                rendering.
              </p>
            </div>
          </div>
        ) : (
          <CollapsibleCode
            code={formattedUiSchema}
            language="json"
            title="UI Schema"
            defaultExpanded={defaultExpanded}
            showCopy={true}
            className="bg-takaro-card border border-takaro-border"
          />
        )}
      </div>

      {/* Configuration help text */}
      <div className="card-takaro bg-takaro-card/50">
        <div className="flex items-start gap-3">
          <svg
            className="w-5 h-5 text-takaro-info flex-shrink-0 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div className="text-sm">
            <h4 className="font-medium text-takaro-text-primary mb-1">
              About Configuration Schemas
            </h4>
            <p className="text-takaro-text-secondary">
              The <strong>Configuration Schema</strong> defines the structure
              and validation rules for module settings. The{' '}
              <strong>UI Schema</strong> customizes how the configuration form
              is displayed in the Takaro interface, including field ordering,
              labels, and input types.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ConfigSection;
