'use client';

import { ModuleFunction } from '@/lib/types';
import { CollapsibleCode } from './CollapsibleCode';
import { MarkdownRenderer } from './MarkdownRenderer';

export interface FunctionsSectionProps {
  /** Array of module functions to display */
  functions: ModuleFunction[];
  /** Additional CSS classes */
  className?: string;
  /** Whether to show function code expanded by default */
  defaultExpanded?: boolean;
}

/**
 * FunctionsSection component for displaying standalone module functions
 * Shows reusable functions that can be imported by other module components
 * Uses CollapsibleCode for function display and follows Takaro design patterns
 */
export function FunctionsSection({
  functions,
  className = '',
  defaultExpanded = false,
}: FunctionsSectionProps) {
  // Handle empty state
  if (!functions || functions.length === 0) {
    return (
      <section
        className={`space-y-4 ${className}`}
        aria-labelledby="functions-section-title"
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
                d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-takaro-text-primary mb-2">
            No Functions Available
          </h3>
          <p className="text-takaro-text-secondary text-sm max-w-md mx-auto">
            This module doesn't provide any reusable functions. Functions allow
            code sharing between commands, hooks, and cron jobs.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      className={`space-y-6 ${className}`}
      aria-labelledby="functions-section-title"
    >
      <div className="space-y-4">
        <h2
          id="functions-section-title"
          className="text-xl font-semibold text-takaro-text-primary border-b border-takaro-border pb-2"
        >
          Functions ({functions.length})
        </h2>
        <p className="text-takaro-text-secondary text-sm">
          Reusable JavaScript functions that can be imported and used by other
          module components like commands, hooks, and cron jobs. These promote
          code reuse and modularity.
        </p>
      </div>

      <div className="space-y-6">
        {functions.map((func, index) => (
          <article
            key={`${func.name}-${index}`}
            className="card-takaro space-y-4"
            aria-labelledby={`function-${index}-title`}
          >
            {/* Function Header */}
            <div className="space-y-3">
              <div className="flex items-start justify-between flex-wrap gap-2">
                <div className="flex-1 min-w-0">
                  <h3
                    id={`function-${index}-title`}
                    className="text-lg font-semibold text-takaro-text-primary truncate"
                  >
                    {func.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="badge-takaro-primary font-mono text-xs">
                      function
                    </span>
                    <span className="text-takaro-text-muted text-xs">
                      Reusable Component
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              {func.description && (
                <div className="bg-takaro-card/50 rounded-md p-3">
                  <h4 className="text-sm font-medium text-takaro-text-primary mb-1">
                    Description
                  </h4>
                  <MarkdownRenderer
                    content={func.description}
                    className="text-sm text-takaro-text-secondary"
                  />
                </div>
              )}
            </div>

            {/* Function Implementation */}
            <div className="space-y-2">
              <h4 className="text-md font-medium text-takaro-text-primary flex items-center gap-2">
                <svg
                  className="w-4 h-4"
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
                    d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                  />
                </svg>
                Function Implementation
              </h4>
              <CollapsibleCode
                code={func.function}
                language="javascript"
                title={`${func.name} Function`}
                defaultExpanded={defaultExpanded}
                className="bg-takaro-card border border-takaro-border"
              />
            </div>

            {/* Usage Example */}
            <div className="bg-takaro-card/50 rounded-md p-3">
              <h4 className="text-sm font-medium text-takaro-text-primary mb-2 flex items-center gap-2">
                <svg
                  className="w-4 h-4"
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
                Import Usage
              </h4>
              <div className="font-mono text-sm bg-takaro-card border border-takaro-border rounded px-3 py-2">
                <span className="text-takaro-text-muted">Import: </span>
                <span className="text-takaro-primary">
                  import {'{'} {func.name} {'}'} from './utils';
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Functions help text */}
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
              About Module Functions
            </h4>
            <p className="text-takaro-text-secondary">
              Functions are <strong>reusable JavaScript components</strong> that
              can be imported and used by commands, hooks, and cron jobs within
              your module. They promote code reuse, improve maintainability, and
              allow you to organize complex logic into modular pieces. Functions
              must be <strong>exported with proper ES6/CommonJS syntax</strong>{' '}
              to be importable by other components.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default FunctionsSection;
