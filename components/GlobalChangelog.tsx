'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChangelogEntry } from '@/lib/types';

interface GlobalChangelogProps {
  /** Array of recent changelog entries to display */
  changes: ChangelogEntry[];
  /** Maximum number of changes to show (default: 10) */
  limit?: number;
}

/**
 * GlobalChangelog component displays recent module updates on the homepage
 * Shows user-friendly descriptions of what changed and why it matters
 */
export default function GlobalChangelog({
  changes,
  limit = 10,
}: GlobalChangelogProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Take only the most recent changes up to the limit
  const recentChanges = changes.slice(0, limit);

  if (recentChanges.length === 0) {
    return null;
  }

  return (
    <section className="mb-8">
      <div
        className="flex items-center justify-between mb-4 cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold">Recent Updates</h2>
          <svg
            className={`w-5 h-5 transition-transform ${isCollapsed ? '' : 'rotate-90'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
        <span className="text-sm text-base-content/70">
          {recentChanges.length} recent {recentChanges.length === 1 ? 'change' : 'changes'}
        </span>
      </div>

      {!isCollapsed && (
        <div className="space-y-4">
          {recentChanges.map((change, index) => (
            <ChangelogCard key={`${change.moduleName}-${change.commitHash}-${index}`} change={change} />
          ))}
        </div>
      )}
    </section>
  );
}

/**
 * Individual changelog card for a single module change
 */
function ChangelogCard({ change }: { change: ChangelogEntry }) {
  const formattedDate = new Date(change.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="card bg-base-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="card-body p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Link
                href={`/module/${change.moduleName}/latest`}
                className="font-semibold text-lg hover:text-primary transition-colors"
              >
                {change.moduleName}
              </Link>
              {change.isNew && (
                <span className="badge badge-success badge-sm">NEW</span>
              )}
              <span className="badge badge-outline badge-sm">
                {change.category}
              </span>
            </div>

            <h3 className="font-medium mb-2">{change.title}</h3>
            <p className="text-sm text-base-content/80">{change.description}</p>
          </div>

          <div className="text-sm text-base-content/60 whitespace-nowrap">
            {formattedDate}
          </div>
        </div>
      </div>
    </div>
  );
}
