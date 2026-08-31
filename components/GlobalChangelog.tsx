'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { ChangelogEntry, ModuleWithMeta } from '@/lib/types';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';

const DEFAULT_VISIBLE_COUNT = 10;

interface GlobalChangelogProps {
  /** Array of changelog entries to display */
  changes: ChangelogEntry[];
  /** Modules currently published in the catalog */
  modules: ModuleWithMeta[];
}

/**
 * GlobalChangelog component displays module updates on the homepage
 * Shows user-friendly descriptions of what changed with filtering options
 */
export default function GlobalChangelog({
  changes,
  modules,
}: GlobalChangelogProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showAll, setShowAll] = useState(false);

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

  // Limit displayed entries based on showAll state
  const visibleChanges = useMemo(() => {
    if (showAll) {
      return filteredChanges;
    }
    return filteredChanges.slice(0, DEFAULT_VISIBLE_COUNT);
  }, [filteredChanges, showAll]);

  const hasMoreEntries = filteredChanges.length > DEFAULT_VISIBLE_COUNT;

  const modulePaths = useMemo(() => {
    const paths = new Map<string, string>();

    modules.forEach((module) => {
      const version =
        module.versions.find((candidate) => candidate.tag === 'latest') ||
        module.versions[0];

      if (!version) {
        return;
      }

      paths.set(
        module.name,
        `/module/${encodeURIComponent(module.name)}/${encodeURIComponent(version.tag)}`,
      );
    });

    return paths;
  }, [modules]);

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
          {visibleChanges.length > 0 ? (
            visibleChanges.map((change, index) => (
              <ChangelogCard
                key={`${change.moduleName}-${change.commitHash}-${index}`}
                change={change}
                modulePath={modulePaths.get(change.moduleName) ?? null}
              />
            ))
          ) : (
            <div className="text-center py-8 text-base-content/60">
              No changes match the selected filters
            </div>
          )}

          {/* Show more/less button */}
          {hasMoreEntries && (
            <div className="text-center pt-2">
              <button
                onClick={() => setShowAll(!showAll)}
                className="btn btn-ghost btn-sm text-primary hover:text-primary-focus"
              >
                {showAll
                  ? 'Show less'
                  : `Show all ${filteredChanges.length} changes`}
              </button>
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
function ChangelogCard({
  change,
  modulePath,
}: {
  change: ChangelogEntry;
  modulePath: string | null;
}) {
  const formattedDate = new Date(change.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const cardBody = (
    <div className="card-body min-w-0 cursor-pointer p-4">
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex min-w-0 flex-wrap items-center gap-2">
            <span className="break-words text-lg font-semibold transition-colors hover:text-primary">
              {change.moduleName}
            </span>
            {change.isNew && (
              <span className="badge badge-success badge-sm shrink-0">NEW</span>
            )}
            <span className="badge badge-outline badge-sm shrink-0">
              {change.category}
            </span>
          </div>

          <h3 className="mb-2 break-words font-medium">{change.title}</h3>
          <div className="min-w-0 overflow-hidden text-sm text-base-content/80">
            <MarkdownRenderer content={change.description} />
          </div>
        </div>

        <div className="shrink-0 text-sm text-base-content/60 sm:whitespace-nowrap">
          {formattedDate}
        </div>
      </div>
    </div>
  );

  if (modulePath) {
    return (
      <Link
        href={modulePath}
        className="card bg-base-200 text-base-content no-underline shadow-sm transition-shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-base-100"
        aria-label={`View ${change.moduleName} module`}
      >
        {cardBody}
      </Link>
    );
  }

  return (
    <article
      className="card bg-base-200 text-base-content shadow-sm opacity-80"
      aria-label={`${change.moduleName} changelog entry`}
    >
      {cardBody}
      <span className="sr-only">Module is not currently in the catalog.</span>
    </article>
  );
}
