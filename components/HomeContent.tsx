'use client';

import { ModuleWithMeta, Changelogs } from '@/lib/types';
import { useCategoryFilter } from './CategoryFilterContext';
import GlobalChangelog from './GlobalChangelog';

export interface HomeContentProps {
  modules: ModuleWithMeta[];
  changelogs: Changelogs | null;
}

export function HomeContent({ modules, changelogs }: HomeContentProps) {
  const { setCategoryFilter } = useCategoryFilter();

  const handleCategoryClick = (category: string) => {
    setCategoryFilter(category);
  };

  const categoryStats: Record<
    string,
    { count: number; modules: ModuleWithMeta[] }
  > = {};
  modules.forEach((module) => {
    const category = module.category || 'Uncategorized';
    if (!categoryStats[category]) {
      categoryStats[category] = { count: 0, modules: [] };
    }
    categoryStats[category].count++;
    categoryStats[category].modules.push(module);
  });

  const categoryCount = Object.keys(categoryStats).length;
  const supportedGames = new Set<string>();
  modules.forEach((module) => {
    if (module.supportedGames?.length) {
      module.supportedGames.forEach((game) => supportedGames.add(game));
    } else if (module.supportgame) {
      supportedGames.add(module.supportgame);
    }
  });

  const categoryInfo: Record<string, { name: string; description: string }> = {
    'anti-cheat': {
      name: 'Anti Cheat',
      description: 'Moderation and enforcement modules for healthier servers.',
    },
    'community-management': {
      name: 'Community Management',
      description: 'Player experience, onboarding, roles, and community tools.',
    },
    minigames: {
      name: 'Minigames',
      description: 'Games and lightweight activities for player engagement.',
    },
    economy: {
      name: 'Economy',
      description: 'Currency, rewards, markets, and progression modules.',
    },
    integration: {
      name: 'Integration',
      description: 'Discord, game connector, and external service workflows.',
    },
    administration: {
      name: 'Administration',
      description: 'Server operations, staff tools, and scheduled automation.',
    },
    events: {
      name: 'Events',
      description: 'Timed activities and gameplay event automation.',
    },
    'Built-in': {
      name: 'Built-in',
      description: 'Official Takaro modules available from the dashboard.',
    },
    Uncategorized: {
      name: 'Uncategorized',
      description: 'Modules that do not have a category assigned yet.',
    },
  };

  const categoryOrder = [
    'anti-cheat',
    'community-management',
    'minigames',
    'economy',
    'integration',
    'administration',
    'events',
    'Built-in',
    'Uncategorized',
  ];

  const sortedCategories = Object.keys(categoryStats).sort((a, b) => {
    const aIndex = categoryOrder.indexOf(a);
    const bIndex = categoryOrder.indexOf(b);

    if (aIndex !== -1 && bIndex !== -1) {
      return aIndex - bIndex;
    } else if (aIndex !== -1) {
      return -1;
    } else if (bIndex !== -1) {
      return 1;
    } else {
      return a.localeCompare(b);
    }
  });

  const formatFallbackCategoryName = (category: string) =>
    category
      .replace('-', ' ')
      .replace(/\b\w/g, (letter) => letter.toUpperCase());

  return (
    <div className="w-full">
      <main className="w-full max-w-none px-4 py-6 lg:px-8 xl:px-10">
        <div className="w-full">
          {/* Hero Section */}
          <div className="mb-8 border-b border-takaro-border pb-8">
            <div className="max-w-4xl">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-takaro-primary">
                Takaro module library
              </p>
              <h1 className="mb-4 text-3xl font-black text-takaro-text-primary md:text-4xl lg:text-5xl">
                Takaro Modules
              </h1>
              <p className="max-w-3xl text-base text-takaro-text-secondary md:text-lg">
                Takaro is a game server management platform for running,
                automating, and moderating multiplayer communities. Browse
                installable modules for Takaro servers, from economy and Discord
                features to moderation tools and scheduled automation.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <a
                  href="https://takaro.io"
                  className="btn-takaro-primary inline-flex items-center justify-center"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Visit takaro.io
                </a>
                <a
                  href="https://docs.takaro.io"
                  className="btn-takaro-outline inline-flex items-center justify-center"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Read docs
                </a>
              </div>
            </div>

            {modules.length > 0 && (
              <div className="mt-6 grid max-w-3xl grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-lg border border-takaro-border bg-takaro-card p-4">
                  <div className="text-2xl font-bold text-takaro-primary">
                    {modules.length}
                  </div>
                  <div className="text-sm text-takaro-text-muted">
                    Total modules
                  </div>
                </div>
                <div className="rounded-lg border border-takaro-border bg-takaro-card p-4">
                  <div className="text-2xl font-bold text-takaro-primary">
                    {categoryCount}
                  </div>
                  <div className="text-sm text-takaro-text-muted">
                    {categoryCount} categories
                  </div>
                </div>
                <div className="rounded-lg border border-takaro-border bg-takaro-card p-4">
                  <div className="text-2xl font-bold text-takaro-primary">
                    {supportedGames.size}
                  </div>
                  <div className="text-sm text-takaro-text-muted">
                    {supportedGames.size} supported games
                  </div>
                </div>
              </div>
            )}
          </div>

          {modules.length > 0 ? (
            <div className="space-y-8">
              {/* Categories Overview */}
              <div className="space-y-6">
                <h2
                  className="text-2xl lg:text-3xl font-semibold text-takaro-text-primary"
                  data-testid="category-section-title"
                >
                  Browse by Category
                </h2>

                <div
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 lg:gap-6"
                  data-testid="category-cards-grid"
                >
                  {sortedCategories.map((category) => {
                    const stats = categoryStats[category];
                    const info = categoryInfo[category] || {
                      name: formatFallbackCategoryName(category),
                      description: `Modules in the ${category} category.`,
                    };

                    return (
                      <div
                        key={category}
                        className="card-takaro card-takaro-hover group flex h-full cursor-pointer flex-col p-4 lg:p-5"
                        data-testid={`category-card-${category}`}
                        onClick={() => handleCategoryClick(category)}
                      >
                        <div className="mb-4 flex items-start justify-between gap-3">
                          <h3 className="text-base font-semibold text-takaro-text-primary transition-colors group-hover:text-takaro-primary lg:text-lg">
                            {info.name}
                          </h3>
                          <div className="rounded-full bg-takaro-card-hover px-2.5 py-1 text-sm font-bold text-takaro-primary">
                            {stats.count}
                          </div>
                        </div>
                        <p className="mb-4 flex-grow text-sm text-takaro-text-secondary">
                          {info.description}
                        </p>
                        {stats.count > 0 && (
                          <div className="mt-auto border-t border-takaro-border pt-3 text-xs text-takaro-text-muted">
                            Examples:{' '}
                            {stats.modules
                              .slice(0, 2)
                              .map((module) =>
                                module.name
                                  .replace('Limon_', '')
                                  .replace('Mad_', ''),
                              )
                              .join(', ')}
                            {stats.count > 2 && `, +${stats.count - 2} more`}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="text-sm lg:text-base text-takaro-text-muted border-t border-takaro-border pt-6 mt-8">
                Select a module from the sidebar to view its configuration,
                commands, hooks, cron jobs, permissions, and install options.
              </div>
            </div>
          ) : (
            <div className="card-takaro text-center py-12">
              <div className="text-takaro-text-muted mb-4">
                <svg
                  className="w-20 h-20 mx-auto opacity-50"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <p className="text-xl lg:text-2xl font-semibold text-takaro-text-primary mb-2">
                No modules found
              </p>
              <p className="text-sm lg:text-base text-takaro-text-muted">
                There are no modules available to display.
              </p>
            </div>
          )}

          {/* Global Changelog Section */}
          {changelogs && changelogs.global.length > 0 && (
            <GlobalChangelog changes={changelogs.global} />
          )}
        </div>
      </main>
    </div>
  );
}
