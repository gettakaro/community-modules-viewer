'use client';

import { ModuleCommand, ArgumentType } from '@/lib/types';
import { CollapsibleCode } from './CollapsibleCode';
import { MarkdownRenderer } from './MarkdownRenderer';

export interface CommandsSectionProps {
  /** Array of module commands to display */
  commands: ModuleCommand[];
  /** Additional CSS classes */
  className?: string;
  /** Whether to show command functions expanded by default */
  defaultExpanded?: boolean;
}

/**
 * CommandsSection component for displaying module commands with their details
 * Shows command triggers, names, help text, arguments, and JavaScript functions
 * Uses CollapsibleCode for function display and follows Takaro design patterns
 */
export function CommandsSection({
  commands,
  className = '',
  defaultExpanded = false,
}: CommandsSectionProps) {
  /**
   * Get badge color class for argument type
   * @param type - Argument type enum value
   * @returns CSS class string for badge styling
   */
  const getArgumentTypeBadge = (type: ArgumentType): string => {
    const badgeMap: Record<ArgumentType, string> = {
      [ArgumentType.STRING]: 'badge-takaro-secondary',
      [ArgumentType.NUMBER]: 'badge-takaro-success',
      [ArgumentType.BOOLEAN]: 'badge-takaro-primary',
      [ArgumentType.PLAYER]: 'badge-takaro-error',
    };
    return badgeMap[type] || 'badge-takaro-secondary';
  };

  /**
   * Format default value for display
   * @param value - Default value to format
   * @returns Formatted string representation
   */
  const formatDefaultValue = (
    value: string | number | boolean | undefined,
  ): string => {
    if (value === undefined || value === null) {
      return 'None';
    }
    if (typeof value === 'string') {
      return `"${value}"`;
    }
    return String(value);
  };

  // Handle empty state
  if (!commands || commands.length === 0) {
    return (
      <section
        className={`space-y-4 ${className}`}
        aria-labelledby="commands-section-title"
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
                d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-takaro-text-primary mb-2">
            No Commands Available
          </h3>
          <p className="text-takaro-text-secondary text-sm max-w-md mx-auto">
            This module doesn't provide any player commands. It may use hooks,
            cron jobs, or functions instead.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      className={`space-y-6 ${className}`}
      aria-labelledby="commands-section-title"
    >
      <div className="space-y-4">
        <h2
          id="commands-section-title"
          className="text-xl font-semibold text-takaro-text-primary border-b border-takaro-border pb-2"
        >
          Commands ({commands.length})
        </h2>
        <p className="text-takaro-text-secondary text-sm">
          These commands can be executed by players in-game. Each command has a
          trigger word, optional arguments, and executes JavaScript code on the
          server.
        </p>
      </div>

      <div className="space-y-6">
        {commands.map((command, index) => (
          <article
            key={`${command.name}-${index}`}
            className="card-takaro space-y-4"
            aria-labelledby={`command-${index}-title`}
          >
            {/* Command Header */}
            <div className="space-y-3">
              <div className="flex items-start justify-between flex-wrap gap-2">
                <div className="flex-1 min-w-0">
                  <h3
                    id={`command-${index}-title`}
                    className="text-lg font-semibold text-takaro-text-primary truncate"
                  >
                    {command.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="badge-takaro-primary font-mono text-xs">
                      /{command.trigger}
                    </span>
                    <span className="text-takaro-text-muted text-xs">
                      Trigger Command
                    </span>
                  </div>
                </div>
              </div>

              {/* Help Text */}
              {command.helpText && (
                <div className="bg-takaro-card/50 rounded-md p-3">
                  <h4 className="text-sm font-medium text-takaro-text-primary mb-1">
                    Description
                  </h4>
                  <MarkdownRenderer
                    content={command.helpText}
                    className="text-sm text-takaro-text-secondary"
                  />
                </div>
              )}
            </div>

            {/* Arguments Section */}
            {command.arguments && command.arguments.length > 0 && (
              <div className="space-y-3">
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
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Arguments ({command.arguments.length})
                </h4>

                <div className="grid gap-3">
                  {command.arguments
                    .sort((a, b) => a.position - b.position)
                    .map((arg, argIndex) => (
                      <div
                        key={`${arg.name}-${argIndex}`}
                        className="bg-takaro-card border border-takaro-border rounded-md p-3"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <h5 className="font-medium text-takaro-text-primary">
                              {arg.name}
                            </h5>
                            <span
                              className={`${getArgumentTypeBadge(arg.type)} text-xs`}
                            >
                              {arg.type}
                            </span>
                            <span className="badge-takaro-secondary text-xs">
                              Position {arg.position}
                            </span>
                          </div>
                        </div>

                        <div className="grid gap-2 text-sm">
                          {arg.helpText && (
                            <div>
                              <span className="text-takaro-text-muted">
                                Help:{' '}
                              </span>
                              <span className="text-takaro-text-secondary">
                                {arg.helpText}
                              </span>
                            </div>
                          )}
                          <div>
                            <span className="text-takaro-text-muted">
                              Default:{' '}
                            </span>
                            <code className="text-xs">
                              {formatDefaultValue(arg.defaultValue)}
                            </code>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Command Function */}
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
                code={command.function}
                language="javascript"
                title={`${command.name} Function`}
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
                Usage Example
              </h4>
              <div className="font-mono text-sm bg-takaro-card border border-takaro-border rounded px-3 py-2">
                <span className="text-takaro-text-muted">Player types: </span>
                <span className="text-takaro-primary">
                  /{command.trigger}
                  {command.arguments && command.arguments.length > 0 && (
                    <span className="text-takaro-text-secondary">
                      {' '}
                      {command.arguments
                        .sort((a, b) => a.position - b.position)
                        .map((arg) => `<${arg.name}>`)
                        .join(' ')}
                    </span>
                  )}
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Commands help text */}
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
              About Module Commands
            </h4>
            <p className="text-takaro-text-secondary">
              Commands allow players to interact with your module through chat.
              Each command has a <strong>trigger</strong> word that players type
              (prefixed with /), optional <strong>arguments</strong> for
              parameters, and a <strong>JavaScript function</strong> that
              executes when the command is used. Arguments are automatically
              validated and passed to the function.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CommandsSection;
