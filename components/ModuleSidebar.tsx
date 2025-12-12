'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ModuleWithMeta } from '@/lib/types';
import { ModuleCard } from './ModuleCard';
import {
  getModuleAuthor,
  getModuleSupportedGame,
  getUniqueAuthors,
  getUniqueSupportedGames,
  formatAuthorName,
} from '@/utils/moduleUtils';

export interface ModuleSidebarProps {
  /** Array of modules to display */
  modules: ModuleWithMeta[];
  /** Current selected module name */
  selectedModule?: string;
  /** Whether sidebar is collapsed on mobile */
  className?: string;
  /** Mobile sidebar state control */
  isMobileOpen?: boolean;
  /** Callback to toggle mobile sidebar */
  onMobileToggle?: (isOpen: boolean) => void;
  /** Controlled category filter state */
  categoryFilter?: string;
  /** Callback for category filter changes */
  onCategoryFilterChange?: (category: string) => void;
}

/**
 * ModuleSidebar component for browsing and filtering modules
 * Provides search, filtering, and navigation functionality
 */
export function ModuleSidebar({
  modules,
  selectedModule,
  className = '',
  isMobileOpen: externalMobileOpen,
  onMobileToggle,
  categoryFilter: externalCategoryFilter,
  onCategoryFilterChange,
}: ModuleSidebarProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [internalCategoryFilter, setInternalCategoryFilter] =
    useState<string>('all');
  const [authorFilter, setAuthorFilter] = useState<string>('all');
  const [gameFilter, setGameFilter] = useState<string>('all');
  const [isHydrated, setIsHydrated] = useState(false);
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(
    new Set(),
  );
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [internalMobileOpen, setInternalMobileOpen] = useState(false);
  const router = useRouter();

  // Use external mobile state if provided, otherwise use internal state
  const isMobileOpen = externalMobileOpen ?? internalMobileOpen;
  const setIsMobileOpen = useMemo(
    () =>
      onMobileToggle
        ? (open: boolean) => onMobileToggle(open)
        : setInternalMobileOpen,
    [onMobileToggle],
  );

  // Use external category filter if provided, otherwise use internal state
  const categoryFilter = externalCategoryFilter ?? internalCategoryFilter;
  const setCategoryFilter = useMemo(
    () =>
      onCategoryFilterChange
        ? (category: string) => onCategoryFilterChange(category)
        : setInternalCategoryFilter,
    [onCategoryFilterChange],
  );

  // Detect mobile screen size
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Load search state from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedSearch = localStorage.getItem('module-search');
      const savedCollapsedCategories = localStorage.getItem(
        'collapsed-categories',
      );
      const savedCollapsed = localStorage.getItem('sidebar-collapsed');

      if (savedSearch) {
        setSearchTerm(savedSearch);
      }
      // Don't load category filter from localStorage if external control is provided
      // The external controller (context) will handle persistence
      if (externalCategoryFilter == null) {
        const savedCategoryFilter = localStorage.getItem(
          'module-category-filter',
        );
        if (savedCategoryFilter) {
          setInternalCategoryFilter(savedCategoryFilter);
        }
      }

      // Load author and game filters
      const savedAuthorFilter = localStorage.getItem('module-author-filter');
      const savedGameFilter = localStorage.getItem('module-game-filter');
      if (savedAuthorFilter) {
        setAuthorFilter(savedAuthorFilter);
      }
      if (savedGameFilter) {
        setGameFilter(savedGameFilter);
      }
      if (savedCollapsedCategories) {
        try {
          const collapsed = JSON.parse(savedCollapsedCategories);
          setCollapsedCategories(new Set(collapsed));
        } catch {
          // Ignore invalid JSON
        }
      }
      if (savedCollapsed) {
        setIsCollapsed(savedCollapsed === 'true');
      }

      // On mobile, start with sidebar closed
      if (window.innerWidth < 768) {
        setIsMobileOpen(false);
      }

      // Mark as hydrated after loading from localStorage
      setIsHydrated(true);
    }
  }, [setIsMobileOpen, externalCategoryFilter]);

  // Save search state to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('module-search', searchTerm);
    }
  }, [searchTerm]);

  useEffect(() => {
    if (typeof window !== 'undefined' && !externalCategoryFilter) {
      localStorage.setItem('module-category-filter', categoryFilter);
    }
  }, [categoryFilter, externalCategoryFilter]);

  // Save author and game filter state to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('module-author-filter', authorFilter);
    }
  }, [authorFilter]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('module-game-filter', gameFilter);
    }
  }, [gameFilter]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        'collapsed-categories',
        JSON.stringify(Array.from(collapsedCategories)),
      );
    }
  }, [collapsedCategories]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sidebar-collapsed', isCollapsed.toString());
    }
  }, [isCollapsed]);

  // Filter and search modules
  const filteredModules = useMemo(() => {
    let filtered = modules;

    // Only apply filters after hydration to prevent SSR/client mismatch
    if (!isHydrated) {
      return filtered.sort((a, b) => a.name.localeCompare(b.name));
    }

    // Filter by category
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(
        (module) => module.category === categoryFilter,
      );
    }

    // Filter by author (case-insensitive)
    if (authorFilter !== 'all') {
      filtered = filtered.filter((module) => {
        const author = getModuleAuthor(module);
        return (
          author?.toLowerCase().trim() === authorFilter.toLowerCase().trim()
        );
      });
    }

    // Filter by supported game
    if (gameFilter !== 'all') {
      filtered = filtered.filter((module) => {
        const game = getModuleSupportedGame(module);
        return game === gameFilter;
      });
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter((module) => {
        const nameMatch = module.name.toLowerCase().includes(term);
        const descMatch = module.versions.some((version) =>
          version.description?.toLowerCase().includes(term),
        );
        const categoryMatch = module.category?.toLowerCase().includes(term);
        const authorMatch = getModuleAuthor(module)
          ?.toLowerCase()
          .includes(term);
        const gameMatch = getModuleSupportedGame(module)
          ?.toLowerCase()
          .includes(term);
        return (
          nameMatch || descMatch || categoryMatch || authorMatch || gameMatch
        );
      });
    }

    return filtered.sort((a, b) => a.name.localeCompare(b.name));
  }, [
    modules,
    searchTerm,
    categoryFilter,
    authorFilter,
    gameFilter,
    isHydrated,
  ]);

  // Group modules by category
  const modulesByCategory = useMemo(() => {
    const groups: Record<string, ModuleWithMeta[]> = {};

    filteredModules.forEach((module) => {
      const category = module.category || 'Uncategorized';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(module);
    });

    // Sort categories, with specific order
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
    const sortedCategories = Object.keys(groups).sort((a, b) => {
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

    const sortedGroups: Record<string, ModuleWithMeta[]> = {};
    sortedCategories.forEach((category) => {
      sortedGroups[category] = groups[category];
    });

    return sortedGroups;
  }, [filteredModules]);

  // Calculate statistics
  const stats = useMemo(() => {
    // Get unique categories, authors, and games
    const categories = new Set(
      modules.map((m) => m.category || 'Uncategorized'),
    );
    const authors = getUniqueAuthors(modules);
    const games = getUniqueSupportedGames(modules);

    return {
      total: modules.length,
      filtered: filteredModules.length,
      categories: Array.from(categories),
      authors,
      games,
    };
  }, [modules, filteredModules]);

  const handleModuleClick = (module: ModuleWithMeta) => {
    // Navigate to the module page (encode name for URL compatibility)
    router.push(`/module/${encodeURIComponent(module.name)}`);
    // Close mobile sidebar after navigation
    if (isMobile) {
      setIsMobileOpen(false);
    }
  };

  // Close mobile sidebar when clicking outside
  useEffect(() => {
    if (isMobileOpen && isMobile) {
      const handleClickOutside = (event: MouseEvent) => {
        const sidebar = document.querySelector(
          '[data-testid="module-sidebar"]',
        );
        if (sidebar && !sidebar.contains(event.target as Node)) {
          setIsMobileOpen(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () =>
        document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isMobileOpen, isMobile, setIsMobileOpen]);

  // Lock body scroll when mobile sidebar is open
  useEffect(() => {
    if (isMobile && isMobileOpen) {
      // Save current scroll position
      const scrollY = window.scrollY;

      // Lock body scroll
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';

      return () => {
        // Restore body scroll
        const savedScrollY = document.body.style.top;
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';

        // Restore scroll position
        if (savedScrollY) {
          window.scrollTo(
            0,
            parseInt(savedScrollY.replace('-', '').replace('px', ''), 10),
          );
        }
      };
    }
  }, [isMobile, isMobileOpen]);

  const clearSearch = () => {
    // Clear search first
    setSearchTerm('');
    // Then clear all filters in next tick
    setTimeout(() => {
      setCategoryFilter('all');
      setAuthorFilter('all');
      setGameFilter('all');
    }, 0);
  };

  const toggleCategory = (category: string) => {
    const newCollapsed = new Set(collapsedCategories);
    if (newCollapsed.has(category)) {
      newCollapsed.delete(category);
    } else {
      newCollapsed.add(category);
    }
    setCollapsedCategories(newCollapsed);
  };

  const formatCategoryName = (category: string) => {
    return category
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isMobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <div
        data-testid="module-sidebar"
        className={`sidebar-takaro ${isCollapsed ? 'sidebar-collapsed' : ''} ${
          isMobile ? (isMobileOpen ? 'sidebar-open' : '') : ''
        } ${className}`}
      >
        {/* Sidebar Header */}
        <div className="sidebar-header">
          <div className="flex items-center justify-between">
            <h2
              className="text-lg font-semibold text-takaro-text-primary cursor-pointer hover:text-takaro-primary transition-colors"
              onClick={() => router.push('/')}
            >
              {isCollapsed ? 'M' : 'Modules'}
            </h2>
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="btn btn-ghost btn-sm p-1"
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <svg
                className={`w-4 h-4 transform transition-transform ${isCollapsed ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={isCollapsed ? 'M9 5l7 7-7 7' : 'M15 19l-7-7 7-7'}
                />
              </svg>
            </button>
          </div>

          {!isCollapsed && (
            <div className="sidebar-stats">
              <div
                className="text-xs text-takaro-text-muted"
                data-testid="search-results-count"
              >
                {stats.filtered} of {stats.total} modules
                {isHydrated &&
                  (searchTerm ||
                    categoryFilter !== 'all' ||
                    authorFilter !== 'all' ||
                    gameFilter !== 'all') && (
                    <button
                      onClick={clearSearch}
                      className="ml-2 text-takaro-primary hover:text-takaro-primary-hover"
                    >
                      Clear
                    </button>
                  )}
              </div>
            </div>
          )}
        </div>

        {!isCollapsed && (
          <>
            {/* Search Input */}
            <div className="sidebar-search">
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-takaro-text-muted"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  type="text"
                  placeholder="Search modules..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  data-testid="search-input"
                  className="input input-bordered w-full pl-10 pr-4 py-2 bg-takaro-card border-takaro-border text-takaro-text-primary placeholder-takaro-text-muted focus:border-takaro-primary"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-takaro-text-muted hover:text-takaro-text-primary"
                    aria-label="Clear search"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Category Filter */}
            <div className="sidebar-filter">
              <div className="mb-2 text-xs font-semibold text-takaro-text-primary">
                Categories
              </div>
              <div
                className="flex flex-wrap gap-1"
                data-testid="category-filter-buttons"
              >
                <button
                  onClick={() => {
                    setCategoryFilter('all');
                    router.push('/');
                  }}
                  className={`btn btn-xs ${
                    categoryFilter === 'all'
                      ? 'btn-takaro-primary'
                      : 'btn-ghost text-takaro-text-muted hover:text-takaro-text-primary'
                  }`}
                  data-testid="category-filter-all"
                >
                  All
                </button>
                {stats.categories.map((category) => {
                  const count = modules.filter(
                    (m) => (m.category || 'Uncategorized') === category,
                  ).length;
                  return (
                    <button
                      key={category}
                      onClick={() => setCategoryFilter(category)}
                      className={`btn btn-xs ${
                        categoryFilter === category
                          ? 'btn-takaro-primary'
                          : 'btn-ghost text-takaro-text-muted hover:text-takaro-text-primary'
                      }`}
                      data-testid={`category-filter-${category}`}
                    >
                      {formatCategoryName(category)} ({count})
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Author Filter */}
            {stats.authors.length > 1 && (
              <div className="sidebar-filter">
                <div className="mb-2 text-xs font-semibold text-takaro-text-primary">
                  Authors
                </div>
                <div className="flex flex-wrap gap-1">
                  <button
                    onClick={() => setAuthorFilter('all')}
                    className={`btn btn-xs ${
                      authorFilter === 'all'
                        ? 'btn-takaro-primary'
                        : 'btn-ghost text-takaro-text-muted hover:text-takaro-text-primary'
                    }`}
                  >
                    All
                  </button>
                  {stats.authors.map((author) => {
                    const count = modules.filter(
                      (m) =>
                        getModuleAuthor(m)?.toLowerCase().trim() ===
                        author.toLowerCase().trim(),
                    ).length;
                    return (
                      <button
                        key={author}
                        onClick={() => setAuthorFilter(author)}
                        className={`btn btn-xs ${
                          authorFilter.toLowerCase().trim() ===
                          author.toLowerCase().trim()
                            ? 'btn-takaro-primary'
                            : 'btn-ghost text-takaro-text-muted hover:text-takaro-text-primary'
                        }`}
                      >
                        {formatAuthorName(author)} ({count})
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Supported Game Filter */}
            {stats.games.length > 1 && (
              <div className="sidebar-filter">
                <div className="mb-2 text-xs font-semibold text-takaro-text-primary">
                  Supported Games
                </div>
                <div className="flex flex-wrap gap-1">
                  <button
                    onClick={() => setGameFilter('all')}
                    className={`btn btn-xs ${
                      gameFilter === 'all'
                        ? 'btn-takaro-primary'
                        : 'btn-ghost text-takaro-text-muted hover:text-takaro-text-primary'
                    }`}
                  >
                    All
                  </button>
                  {stats.games.map((game) => {
                    const count = modules.filter(
                      (m) => getModuleSupportedGame(m) === game,
                    ).length;
                    return (
                      <button
                        key={game}
                        onClick={() => setGameFilter(game)}
                        className={`btn btn-xs ${
                          gameFilter === game
                            ? 'btn-takaro-primary'
                            : 'btn-ghost text-takaro-text-muted hover:text-takaro-text-primary'
                        }`}
                      >
                        {game} ({count})
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Module List */}
            <div className="sidebar-modules">
              {Object.keys(modulesByCategory).length === 0 ? (
                <div className="text-center py-8 text-takaro-text-muted">
                  <svg
                    className="w-8 h-8 mx-auto mb-2 opacity-50"
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
                  <div className="text-sm">
                    {isHydrated &&
                    (searchTerm ||
                      categoryFilter !== 'all' ||
                      authorFilter !== 'all' ||
                      gameFilter !== 'all')
                      ? 'No modules match your filters'
                      : 'No modules available'}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {Object.entries(modulesByCategory).map(
                    ([category, categoryModules]) => (
                      <div
                        key={category}
                        className="space-y-2"
                        data-testid={`category-group-${category}`}
                      >
                        {/* Category Header */}
                        <div className="flex items-center justify-between">
                          <button
                            onClick={() => toggleCategory(category)}
                            className="flex items-center gap-2 text-sm font-semibold text-takaro-text-primary hover:text-takaro-primary transition-colors"
                            data-testid={`category-toggle-${category}`}
                          >
                            <svg
                              className={`w-4 h-4 transform transition-transform ${
                                collapsedCategories.has(category)
                                  ? ''
                                  : 'rotate-90'
                              }`}
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
                            {formatCategoryName(category)}
                          </button>
                          <span className="text-xs text-takaro-text-muted">
                            {categoryModules.length}
                          </span>
                        </div>

                        {/* Category Modules */}
                        {!collapsedCategories.has(category) && (
                          <div
                            className="space-y-2 ml-4"
                            data-testid={`category-modules-${category}`}
                          >
                            {categoryModules.map((module) => (
                              <ModuleCard
                                key={module.name}
                                module={module}
                                onClick={handleModuleClick}
                                isSelected={selectedModule === module.name}
                                className="module-card-sidebar"
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    ),
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}

/**
 * Mobile hamburger button for toggling the sidebar
 */
export interface MobileMenuButtonProps {
  /** Whether the sidebar is open */
  isOpen?: boolean;
  /** Callback to toggle sidebar */
  onToggle?: () => void;
  /** Additional CSS classes */
  className?: string;
}

export function MobileMenuButton({
  isOpen = false,
  onToggle,
  className = '',
}: MobileMenuButtonProps) {
  return (
    <button
      onClick={onToggle}
      className={`
        fixed top-4 z-[60] p-3 bg-takaro-card border border-takaro-border rounded-lg
        shadow-lg md:hidden transition-all duration-300 hover:bg-takaro-card-hover
        ${isOpen ? 'left-80' : 'left-4'}
        ${className}
      `}
      style={{
        left: isOpen ? 'calc(288px + 1rem)' : '1rem',
      }}
      aria-label={isOpen ? 'Close menu' : 'Open menu'}
      aria-expanded={isOpen}
    >
      <div className="w-6 h-6 flex flex-col justify-center space-y-1">
        <span
          className={`
            block h-0.5 bg-takaro-text-primary transition-all duration-300 origin-center
            ${isOpen ? 'rotate-45 translate-y-1' : ''}
          `}
        />
        <span
          className={`
            block h-0.5 bg-takaro-text-primary transition-all duration-300
            ${isOpen ? 'opacity-0' : ''}
          `}
        />
        <span
          className={`
            block h-0.5 bg-takaro-text-primary transition-all duration-300 origin-center
            ${isOpen ? '-rotate-45 -translate-y-1' : ''}
          `}
        />
      </div>
    </button>
  );
}

export default ModuleSidebar;
