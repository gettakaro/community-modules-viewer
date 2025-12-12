'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { ChangelogEntry } from '@/lib/types';

interface GlobalChangelogProps {
  /** Array of changelog entries to display */
  changes: ChangelogEntry[];
}

/**
 * GlobalChangelog component displays module updates on the homepage
 * Shows user-friendly descriptions of what changed with filtering options
 */
export default function GlobalChangelog({ changes }: GlobalChangelogProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Get unique categories from changes
  const categories = useMemo(() => {
    const cats = new Set(changes.map((c) => c.category));
    return ['all', ...Array.from(cats).sort()];
  }, [changes]);

  // Filter changes based on selected filters
  const filteredChanges = useMemo(() => {
    return changes.filter((change) => {
      const categoryMatch =
        selectedCategory === 'all' || change.category === selectedCategory;
      const statusMatch =
        selectedStatus === 'all' ||
        (selectedStatus === 'new' && change.isNew) ||
        (selectedStatus === 'updated' && !change.isNew);
      return categoryMatch && statusMatch;
    });
  }, [changes, selectedCategory, selectedStatus]);

  if (changes.length === 0) {
    return null;
  }

  return (
    <section className="mb-8">
      <div
        className="flex items-center justify-between mb-4 cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold">Module Changelog</h2>
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
          {filteredChanges.length} of {changes.length}{' '}
          {filteredChanges.length === 1 ? 'change' : 'changes'}
        </span>
      </div>

      {!isCollapsed && (
        <div className="space-y-4">
          {/* Filter Controls */}
          <div className="flex flex-wrap gap-4 mb-4">
            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-base-content/80">
                Category:
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="select select-bordered select-sm"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? 'All Categories' : cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-base-content/80">
                Status:
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="select select-bordered select-sm"
              >
                <option value="all">All</option>
                <option value="new">New Modules</option>
                <option value="updated">Updates</option>
              </select>
            </div>
          </div>

          {/* Changelog Entries */}
          {filteredChanges.length > 0 ? (
            filteredChanges.map((change, index) => (
              <ChangelogCard
                key={`${change.moduleName}-${change.commitHash}-${index}`}
                change={change}
              />
            ))
          ) : (
            <div className="text-center py-8 text-base-content/60">
              No changes match the selected filters
            </div>
          )}
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
                href={`/module/${encodeURIComponent(change.moduleName)}/latest`}
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
