'use client';

import { ModuleCronJob } from '@/lib/types';
import { CollapsibleCode } from './CollapsibleCode';
import { MarkdownRenderer } from './MarkdownRenderer';

export interface CronJobsSectionProps {
  /** Array of module cron jobs to display */
  cronJobs: ModuleCronJob[];
  /** Additional CSS classes */
  className?: string;
  /** Whether to show cron job functions expanded by default */
  defaultExpanded?: boolean;
}

/**
 * CronJobsSection component for displaying module cron jobs with their details
 * Shows cron job names, descriptions, temporal values (cron expressions), and JavaScript functions
 * Uses CollapsibleCode for function display and follows Takaro design patterns
 */
export function CronJobsSection({
  cronJobs,
  className = '',
  defaultExpanded = false,
}: CronJobsSectionProps) {
  /**
   * Parse cron expression and return human-readable explanation
   * @param cronExpression - Standard cron expression (e.g., "0 * * * *")
   * @returns Human-readable explanation of the cron schedule
   */
  const parseCronExpression = (cronExpression: string): string => {
    if (!cronExpression || typeof cronExpression !== 'string') {
      return 'Invalid cron expression';
    }

    const parts = cronExpression.trim().split(/\s+/);

    // Handle different cron formats (5 or 6 parts)
    if (parts.length < 5 || parts.length > 6) {
      return 'Invalid cron format';
    }

    const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;

    // Common patterns with specific explanations
    const commonPatterns: Record<string, string> = {
      '* * * * *': 'Every minute',
      '0 * * * *': 'Every hour',
      '0 0 * * *': 'Daily at midnight',
      '0 0 * * 0': 'Weekly on Sunday at midnight',
      '0 0 1 * *': 'Monthly on the 1st at midnight',
      '0 0 1 1 *': 'Yearly on January 1st at midnight',
      '*/5 * * * *': 'Every 5 minutes',
      '*/10 * * * *': 'Every 10 minutes',
      '*/15 * * * *': 'Every 15 minutes',
      '*/30 * * * *': 'Every 30 minutes',
      '0 */2 * * *': 'Every 2 hours',
      '0 */6 * * *': 'Every 6 hours',
      '0 */12 * * *': 'Every 12 hours',
      '0 0 */2 * *': 'Every 2 days at midnight',
      '0 0 * * 1': 'Weekly on Monday at midnight',
      '0 0 * * 1-5': 'Weekdays at midnight',
      '0 0 * * 6,0': 'Weekends at midnight',
      '0 6 * * *': 'Daily at 6:00 AM',
      '0 18 * * *': 'Daily at 6:00 PM',
      '0 12 * * 0': 'Sundays at noon',
      '0 0 15 * *': 'Monthly on the 15th at midnight',
    };

    // Check for exact matches first
    const fivePartExpression = parts.slice(0, 5).join(' ');
    if (commonPatterns[fivePartExpression]) {
      return commonPatterns[fivePartExpression];
    }

    // Parse individual components for custom expressions
    let explanation = '';

    // Minutes
    if (minute === '*') {
      explanation += 'every minute';
    } else if (minute.startsWith('*/')) {
      const interval = minute.substring(2);
      explanation += `every ${interval} minutes`;
    } else if (minute.includes(',')) {
      explanation += `at minutes ${minute}`;
    } else {
      explanation += `at minute ${minute}`;
    }

    // Hours
    if (hour === '*') {
      explanation += ' of every hour';
    } else if (hour.startsWith('*/')) {
      const interval = hour.substring(2);
      explanation += ` of every ${interval} hours`;
    } else if (hour.includes(',')) {
      explanation += ` of hours ${hour}`;
    } else {
      const hourNum = parseInt(hour, 10);
      const time =
        hourNum === 0
          ? '12 AM'
          : hourNum < 12
            ? `${hourNum} AM`
            : hourNum === 12
              ? '12 PM'
              : `${hourNum - 12} PM`;
      explanation += ` at ${time}`;
    }

    // Day of month
    if (dayOfMonth === '*') {
      explanation += ' on every day of the month';
    } else if (dayOfMonth.startsWith('*/')) {
      const interval = dayOfMonth.substring(2);
      explanation += ` every ${interval} days`;
    } else if (dayOfMonth.includes(',')) {
      explanation += ` on days ${dayOfMonth} of the month`;
    } else {
      explanation += ` on day ${dayOfMonth} of the month`;
    }

    // Month
    if (month === '*') {
      explanation += ' in every month';
    } else if (month.includes(',')) {
      explanation += ` in months ${month}`;
    } else {
      const monthNames = [
        '',
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
      ];
      const monthNum = parseInt(month, 10);
      explanation += ` in ${monthNames[monthNum] || month}`;
    }

    // Day of week
    if (dayOfWeek === '*') {
      explanation += ' on every day of the week';
    } else if (dayOfWeek.includes(',')) {
      explanation += ` on days of week ${dayOfWeek}`;
    } else {
      const dayNames = [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
      ];
      const dayNum = parseInt(dayOfWeek, 10);
      explanation += ` on ${dayNames[dayNum] || dayOfWeek}`;
    }

    // Capitalize first letter
    return explanation.charAt(0).toUpperCase() + explanation.slice(1);
  };

  /**
   * Get badge color class for cron job frequency
   * @param cronExpression - Cron expression to analyze
   * @returns CSS class string for badge styling
   */
  const getCronFrequencyBadge = (cronExpression: string): string => {
    if (cronExpression.includes('* * * * *')) {
      return 'badge-takaro-error'; // Very frequent
    }
    if (cronExpression.includes('*/') && cronExpression.includes('* * * *')) {
      const match = cronExpression.match(/\*\/(\d+)/);
      if (match) {
        const interval = parseInt(match[1], 10);
        if (interval <= 5) return 'badge-takaro-error'; // Very frequent
        if (interval <= 30) return 'badge-takaro-warning'; // Frequent
      }
    }
    if (
      cronExpression.includes('0 * * * *') ||
      cronExpression.includes('0 0 * * *')
    ) {
      return 'badge-takaro-success'; // Reasonable frequency
    }
    return 'badge-takaro-secondary'; // Default
  };

  // Handle empty state
  if (!cronJobs || cronJobs.length === 0) {
    return (
      <section
        className={`space-y-4 ${className}`}
        aria-labelledby="cronjobs-section-title"
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
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-takaro-text-primary mb-2">
            No Scheduled Jobs
          </h3>
          <p className="text-takaro-text-secondary text-sm max-w-md mx-auto">
            This module doesn't have any scheduled cron jobs. It may use
            commands, hooks, or functions instead.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      className={`space-y-6 ${className}`}
      aria-labelledby="cronjobs-section-title"
    >
      <div className="space-y-4">
        <h2
          id="cronjobs-section-title"
          className="text-xl font-semibold text-takaro-text-primary border-b border-takaro-border pb-2"
        >
          Scheduled Jobs ({cronJobs.length})
        </h2>
        <p className="text-takaro-text-secondary text-sm">
          These jobs run automatically on a schedule defined by cron
          expressions. Each job executes JavaScript code at specific times or
          intervals.
        </p>
      </div>

      <div className="space-y-6">
        {cronJobs.map((cronJob, index) => (
          <article
            key={`${cronJob.name}-${index}`}
            className="card-takaro space-y-4"
            aria-labelledby={`cronjob-${index}-title`}
          >
            {/* Cron Job Header */}
            <div className="space-y-3">
              <div className="flex items-start justify-between flex-wrap gap-2">
                <div className="flex-1 min-w-0">
                  <h3
                    id={`cronjob-${index}-title`}
                    className="text-lg font-semibold text-takaro-text-primary truncate"
                  >
                    {cronJob.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="badge-takaro-primary font-mono text-xs">
                      {cronJob.temporalValue}
                    </span>
                    <span
                      className={`${getCronFrequencyBadge(cronJob.temporalValue)} text-xs`}
                    >
                      Schedule
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              {cronJob.description && (
                <div className="bg-takaro-card/50 rounded-md p-3">
                  <h4 className="text-sm font-medium text-takaro-text-primary mb-1">
                    Description
                  </h4>
                  <MarkdownRenderer
                    content={cronJob.description}
                    className="text-sm text-takaro-text-secondary"
                  />
                </div>
              )}
            </div>

            {/* Schedule Information */}
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
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                Schedule Details
              </h4>

              <div className="bg-takaro-card border border-takaro-border rounded-md p-3">
                <div className="grid gap-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h5 className="font-medium text-takaro-text-primary mb-1">
                        Cron Expression
                      </h5>
                      <div className="font-mono text-sm bg-takaro-card/50 px-2 py-1 rounded border">
                        {cronJob.temporalValue}
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-takaro-border pt-3">
                    <h5 className="font-medium text-takaro-text-primary mb-1">
                      Human-Readable Schedule
                    </h5>
                    <p className="text-sm text-takaro-text-secondary">
                      {parseCronExpression(cronJob.temporalValue)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Cron Job Function */}
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
                code={cronJob.function}
                language="javascript"
                title={`${cronJob.name} Function`}
                defaultExpanded={defaultExpanded}
                className="bg-takaro-card border border-takaro-border"
              />
            </div>

            {/* Cron Expression Help */}
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
                Cron Expression Format
              </h4>
              <div className="text-sm text-takaro-text-secondary">
                <div className="font-mono text-xs bg-takaro-card border border-takaro-border rounded px-2 py-1 mb-2">
                  minute hour day-of-month month day-of-week
                </div>
                <p>
                  Each field can contain numbers, ranges (1-5), lists (1,3,5),
                  or wildcards (*). Use */n for intervals (e.g., */5 for every 5
                  units).
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Cron Jobs help text */}
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
              About Scheduled Jobs
            </h4>
            <p className="text-takaro-text-secondary">
              Cron jobs allow your module to execute code automatically on a
              schedule. Each job has a <strong>cron expression</strong> that
              defines when it runs, and a <strong>JavaScript function</strong>{' '}
              that executes at those times. Jobs run server-side and can perform
              maintenance tasks, send notifications, or update game state
              automatically.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CronJobsSection;
