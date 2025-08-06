'use client';

import { ModuleWithMeta } from '@/lib/types';
import { useCategoryFilter } from './CategoryFilterContext';

export interface HomeContentProps {
  modules: ModuleWithMeta[];
}

export function HomeContent({ modules }: HomeContentProps) {
  const { setCategoryFilter } = useCategoryFilter();

  const handleCategoryClick = (category: string) => {
    setCategoryFilter(category);
  };

  return (
    <div className="w-full">
      <main className="w-full max-w-none px-4 py-6 lg:px-8">
        <div className="w-full">
          {/* Hero Section */}
          <div className="card-takaro mb-8 p-6 lg:p-8">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-takaro-text-primary mb-4">
              Community Modules Viewer
            </h1>
            <p className="text-lg text-takaro-text-secondary mb-6 max-w-3xl">
              Browse and explore Takaro modules from the community and built-in
              collections. Use the sidebar to search, filter, and navigate
              between modules.
            </p>

            {modules.length > 0 && (
              <div className="stat-card bg-takaro-card-hover p-4 rounded-lg inline-block">
                <div className="text-3xl font-bold text-takaro-primary">
                  {modules.length}
                </div>
                <div className="text-sm text-takaro-text-muted">
                  Total Modules
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
                  {(() => {
                    // Group modules by category and calculate stats
                    const categoryStats: Record<
                      string,
                      { count: number; modules: any[] }
                    > = {};
                    modules.forEach((module) => {
                      const category = module.category || 'Uncategorized';
                      if (!categoryStats[category]) {
                        categoryStats[category] = { count: 0, modules: [] };
                      }
                      categoryStats[category].count++;
                      categoryStats[category].modules.push(module);
                    });

                    // Define category info with descriptions
                    const categoryInfo: Record<
                      string,
                      { name: string; description: string; icon: string }
                    > = {
                      'anti-cheat': {
                        name: 'Anti Cheat',
                        description:
                          'Security and moderation tools to keep your server safe',
                        icon: '🛡️',
                      },
                      'community-management': {
                        name: 'Community Management',
                        description:
                          'Tools for managing your community and player experience',
                        icon: '👥',
                      },
                      minigames: {
                        name: 'Minigames',
                        description:
                          'Fun games and entertainment for your players',
                        icon: '🎮',
                      },
                      economy: {
                        name: 'Economy',
                        description:
                          'Currency, trading, and reward systems for your server',
                        icon: '💰',
                      },
                      integration: {
                        name: 'Integration',
                        description:
                          'Connect your server with Discord and other services',
                        icon: '🔗',
                      },
                      administration: {
                        name: 'Administration',
                        description:
                          'Server management, automation, and admin tools',
                        icon: '⚙️',
                      },
                      events: {
                        name: 'Events',
                        description:
                          'Special events and enhanced gameplay features',
                        icon: '🎉',
                      },
                      'Built-in': {
                        name: 'Built-in',
                        description: 'Official modules included with Takaro',
                        icon: '📋',
                      },
                      Uncategorized: {
                        name: 'Uncategorized',
                        description: 'Other useful modules and utilities',
                        icon: '📦',
                      },
                    };

                    // Sort categories by predefined order
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
                    const sortedCategories = Object.keys(categoryStats).sort(
                      (a, b) => {
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
                      },
                    );

                    return sortedCategories.map((category) => {
                      const stats = categoryStats[category];
                      const info = categoryInfo[category] || {
                        name: category
                          .replace('-', ' ')
                          .replace(/\b\w/g, (l) => l.toUpperCase()),
                        description: `Modules in the ${category} category`,
                        icon: '📁',
                      };

                      return (
                        <div
                          key={category}
                          className="card-takaro card-takaro-hover p-4 lg:p-6 cursor-pointer group h-full flex flex-col"
                          data-testid={`category-card-${category}`}
                          onClick={() => handleCategoryClick(category)}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="text-2xl lg:text-3xl">
                              {info.icon}
                            </div>
                            <div className="text-xl lg:text-2xl font-bold text-takaro-primary">
                              {stats.count}
                            </div>
                          </div>
                          <h3 className="text-base lg:text-lg font-semibold text-takaro-text-primary mb-2 group-hover:text-takaro-primary transition-colors">
                            {info.name}
                          </h3>
                          <p className="text-xs lg:text-sm text-takaro-text-secondary mb-4 flex-grow">
                            {info.description}
                          </p>
                          {stats.count > 0 && (
                            <div className="text-xs text-takaro-text-muted mt-auto">
                              Popular:{' '}
                              {stats.modules
                                .slice(0, 2)
                                .map((m) =>
                                  m.name
                                    .replace('Limon_', '')
                                    .replace('Mad_', ''),
                                )
                                .join(', ')}
                              {stats.count > 2 && `, +${stats.count - 2} more`}
                            </div>
                          )}
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>

              <div className="text-sm lg:text-base text-takaro-text-muted border-t border-takaro-border pt-6 mt-8">
                💡 Select a module from the sidebar to view its details,
                configuration, commands, and more. Use the category filters to
                find modules that fit your server's needs.
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
        </div>
      </main>
    </div>
  );
}
