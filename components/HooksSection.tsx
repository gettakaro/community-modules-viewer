'use client';

import { ModuleHook, HookEventType } from '@/lib/types';
import { CollapsibleCode } from './CollapsibleCode';

export interface HooksSectionProps {
  /** Array of module hooks to display */
  hooks: ModuleHook[];
  /** Additional CSS classes */
  className?: string;
  /** Whether to show hook functions expanded by default */
  defaultExpanded?: boolean;
}

/**
 * HooksSection component for displaying module hooks with their details
 * Groups hooks by event type, shows descriptions, regex patterns, and JavaScript functions
 * Uses CollapsibleCode for function display and follows Takaro design patterns
 */
export function HooksSection({
  hooks,
  className = '',
  defaultExpanded = false,
}: HooksSectionProps) {
  /**
   * Get badge color class for hook event type
   * @param eventType - Hook event type
   * @returns CSS class string for badge styling
   */
  const getEventTypeBadge = (eventType: HookEventType): string => {
    // Real-time events
    if (
      [
        'chat-message',
        'player-connected',
        'player-disconnected',
        'discord-message',
      ].includes(eventType)
    ) {
      return 'badge-takaro-primary';
    }

    // System events
    if (['server-status-changed', 'log', 'entity-killed'].includes(eventType)) {
      return 'badge-takaro-secondary';
    }

    // Player events
    if (
      [
        'player-new-ip-detected',
        'role-assigned',
        'role-removed',
        'command-executed',
      ].includes(eventType)
    ) {
      return 'badge-takaro-success';
    }

    // Default for custom event types
    return 'badge-takaro-secondary';
  };

  /**
   * Get event type category for grouping
   * @param eventType - Hook event type
   * @returns Category name for grouping
   */
  const getEventTypeCategory = (eventType: HookEventType): string => {
    if (
      [
        'chat-message',
        'player-connected',
        'player-disconnected',
        'discord-message',
      ].includes(eventType)
    ) {
      return 'Real-time Events';
    }

    if (['server-status-changed', 'log', 'entity-killed'].includes(eventType)) {
      return 'System Events';
    }

    if (
      [
        'player-new-ip-detected',
        'role-assigned',
        'role-removed',
        'command-executed',
      ].includes(eventType)
    ) {
      return 'Player Events';
    }

    return 'Custom Events';
  };

  /**
   * Group hooks by event type category
   * @param hooks - Array of hooks to group
   * @returns Object with grouped hooks
   */
  const groupHooksByCategory = (
    hooks: ModuleHook[],
  ): Record<string, ModuleHook[]> => {
    return hooks.reduce(
      (groups, hook) => {
        const category = getEventTypeCategory(hook.eventType);
        if (!groups[category]) {
          groups[category] = [];
        }
        groups[category].push(hook);
        return groups;
      },
      {} as Record<string, ModuleHook[]>,
    );
  };

  /**
   * Get icon for event type category
   * @param category - Event type category
   * @returns JSX element for category icon
   */
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Real-time Events':
        return (
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
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
        );
      case 'System Events':
        return (
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
              d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
            />
          </svg>
        );
      case 'Player Events':
        return (
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
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        );
      default:
        return (
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
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        );
    }
  };

  // Handle empty state
  if (!hooks || hooks.length === 0) {
    return (
      <section
        className={`space-y-4 ${className}`}
        aria-labelledby="hooks-section-title"
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
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-takaro-text-primary mb-2">
            No Hooks Available
          </h3>
          <p className="text-takaro-text-secondary text-sm max-w-md mx-auto">
            This module doesn't respond to any game events. It may use commands,
            cron jobs, or functions instead.
          </p>
        </div>
      </section>
    );
  }

  const groupedHooks = groupHooksByCategory(hooks);
  const categoryOrder = [
    'Real-time Events',
    'System Events',
    'Player Events',
    'Custom Events',
  ];
  const sortedCategories = categoryOrder.filter(
    (category) => groupedHooks[category],
  );

  return (
    <section
      className={`space-y-6 ${className}`}
      aria-labelledby="hooks-section-title"
    >
      <div className="space-y-4">
        <h2
          id="hooks-section-title"
          className="text-xl font-semibold text-takaro-text-primary border-b border-takaro-border pb-2"
        >
          Hooks ({hooks.length})
        </h2>
        <p className="text-takaro-text-secondary text-sm">
          These hooks respond to various game events automatically. Each hook
          executes JavaScript code when its specific event type occurs, allowing
          modules to react to player actions, system changes, and more.
        </p>
      </div>

      <div className="space-y-8">
        {sortedCategories.map((category) => (
          <div key={category} className="space-y-4">
            {/* Category Header */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-takaro-text-primary">
                {getCategoryIcon(category)}
                <h3 className="text-lg font-semibold">{category}</h3>
              </div>
              <span className="badge-takaro-secondary text-xs">
                {groupedHooks[category].length} hook
                {groupedHooks[category].length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Hooks in Category */}
            <div className="space-y-4">
              {groupedHooks[category].map((hook, index) => (
                <article
                  key={`${hook.name}-${index}`}
                  className="card-takaro space-y-4"
                  aria-labelledby={`hook-${category}-${index}-title`}
                >
                  {/* Hook Header */}
                  <div className="space-y-3">
                    <div className="flex items-start justify-between flex-wrap gap-2">
                      <div className="flex-1 min-w-0">
                        <h4
                          id={`hook-${category}-${index}-title`}
                          className="text-lg font-semibold text-takaro-text-primary truncate"
                        >
                          {hook.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span
                            className={`${getEventTypeBadge(hook.eventType)} font-mono text-xs`}
                          >
                            {hook.eventType}
                          </span>
                          <span className="text-takaro-text-muted text-xs">
                            Event Type
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    {hook.description && (
                      <div className="bg-takaro-card/50 rounded-md p-3">
                        <h5 className="text-sm font-medium text-takaro-text-primary mb-1">
                          Description
                        </h5>
                        <p className="text-sm text-takaro-text-secondary">
                          {hook.description}
                        </p>
                      </div>
                    )}

                    {/* Regex Pattern */}
                    {hook.regex && (
                      <div className="bg-takaro-card/50 rounded-md p-3">
                        <h5 className="text-sm font-medium text-takaro-text-primary mb-2 flex items-center gap-2">
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
                              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                          </svg>
                          Pattern Match
                        </h5>
                        <div className="font-mono text-sm bg-takaro-card border border-takaro-border rounded px-3 py-2">
                          <code className="text-takaro-text-primary">
                            {hook.regex}
                          </code>
                        </div>
                        <p className="text-xs text-takaro-text-muted mt-1">
                          This hook only triggers when the event data matches
                          this regular expression pattern.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Hook Function */}
                  <div className="space-y-2">
                    <h5 className="text-md font-medium text-takaro-text-primary flex items-center gap-2">
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
                    </h5>
                    <CollapsibleCode
                      code={hook.function}
                      language="javascript"
                      title={`${hook.name} Hook Function`}
                      defaultExpanded={defaultExpanded}
                      showCopy={true}
                      className="bg-takaro-card border border-takaro-border"
                    />
                  </div>

                  {/* Event Details */}
                  <div className="bg-takaro-card/50 rounded-md p-3">
                    <h5 className="text-sm font-medium text-takaro-text-primary mb-2 flex items-center gap-2">
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
                      Event Details
                    </h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-takaro-text-muted">
                          Event Type:
                        </span>
                        <span
                          className={`${getEventTypeBadge(hook.eventType)} text-xs`}
                        >
                          {hook.eventType}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-takaro-text-muted">Trigger:</span>
                        <span className="text-takaro-text-secondary">
                          {hook.regex ? 'Pattern Match Required' : 'Automatic'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-takaro-text-muted">
                          Category:
                        </span>
                        <span className="text-takaro-text-secondary">
                          {category}
                        </span>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Hooks help text */}
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
              About Module Hooks
            </h4>
            <p className="text-takaro-text-secondary">
              Hooks allow your module to respond automatically to game events
              like player actions, server status changes, and chat messages.
              Each hook has an <strong>event type</strong> that determines when
              it triggers, optional <strong>regex patterns</strong> for
              filtering specific events, and a{' '}
              <strong>JavaScript function</strong> that executes when the
              conditions are met. Hooks are grouped by category for better
              organization.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HooksSection;
