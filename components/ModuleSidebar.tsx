'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ModuleWithMeta } from '@/lib/types';
import { ModuleCard } from './ModuleCard';

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
}: ModuleSidebarProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sourceFilter, setSourceFilter] = useState<
    'all' | 'community' | 'builtin'
  >('all');
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
      const savedFilter = localStorage.getItem('module-source-filter');
      const savedCollapsed = localStorage.getItem('sidebar-collapsed');

      if (savedSearch) {
        setSearchTerm(savedSearch);
      }
      if (
        savedFilter &&
        ['all', 'community', 'builtin'].includes(savedFilter)
      ) {
        setSourceFilter(savedFilter as 'all' | 'community' | 'builtin');
      }
      if (savedCollapsed) {
        setIsCollapsed(savedCollapsed === 'true');
      }

      // On mobile, start with sidebar closed
      if (window.innerWidth < 768) {
        setIsMobileOpen(false);
      }
    }
  }, [setIsMobileOpen]);

  // Save search state to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('module-search', searchTerm);
    }
  }, [searchTerm]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('module-source-filter', sourceFilter);
    }
  }, [sourceFilter]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sidebar-collapsed', isCollapsed.toString());
    }
  }, [isCollapsed]);

  // Filter and search modules
  const filteredModules = useMemo(() => {
    let filtered = modules;

    // Filter by source
    if (sourceFilter !== 'all') {
      filtered = filtered.filter((module) => module.source === sourceFilter);
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter((module) => {
        const nameMatch = module.name.toLowerCase().includes(term);
        const descMatch = module.versions.some((version) =>
          version.description?.toLowerCase().includes(term),
        );
        return nameMatch || descMatch;
      });
    }

    return filtered.sort((a, b) => a.name.localeCompare(b.name));
  }, [modules, searchTerm, sourceFilter]);

  // Calculate statistics
  const stats = useMemo(() => {
    const communityCount = modules.filter(
      (m) => m.source === 'community',
    ).length;
    const builtinCount = modules.filter((m) => m.source === 'builtin').length;
    return {
      total: modules.length,
      community: communityCount,
      builtin: builtinCount,
      filtered: filteredModules.length,
    };
  }, [modules, filteredModules]);

  const handleModuleClick = (module: ModuleWithMeta) => {
    // Navigate to the module page
    router.push(`/module/${module.name}`);
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
    setSearchTerm('');
    setSourceFilter('all');
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
            <h2 className="text-lg font-semibold text-takaro-text-primary">
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
                {(searchTerm || sourceFilter !== 'all') && (
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

            {/* Source Filter */}
            <div className="sidebar-filter">
              <div className="flex gap-1">
                <button
                  onClick={() => setSourceFilter('all')}
                  className={`btn btn-sm flex-1 ${
                    sourceFilter === 'all'
                      ? 'btn-takaro-primary'
                      : 'btn-ghost text-takaro-text-muted hover:text-takaro-text-primary'
                  }`}
                >
                  All ({stats.total})
                </button>
                <button
                  onClick={() => setSourceFilter('community')}
                  className={`btn btn-sm flex-1 ${
                    sourceFilter === 'community'
                      ? 'btn-takaro-primary'
                      : 'btn-ghost text-takaro-text-muted hover:text-takaro-text-primary'
                  }`}
                >
                  Community ({stats.community})
                </button>
                <button
                  onClick={() => setSourceFilter('builtin')}
                  className={`btn btn-sm flex-1 ${
                    sourceFilter === 'builtin'
                      ? 'btn-takaro-primary'
                      : 'btn-ghost text-takaro-text-muted hover:text-takaro-text-primary'
                  }`}
                >
                  Built-in ({stats.builtin})
                </button>
              </div>
            </div>

            {/* Module List */}
            <div className="sidebar-modules">
              {filteredModules.length === 0 ? (
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
                    {searchTerm || sourceFilter !== 'all'
                      ? 'No modules match your filters'
                      : 'No modules available'}
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredModules.map((module) => (
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
        fixed top-4 left-4 z-[60] p-3 bg-takaro-card border border-takaro-border rounded-lg
        shadow-lg md:hidden transition-all duration-300 hover:bg-takaro-card-hover
        ${isOpen ? 'left-72' : 'left-4'}
        ${className}
      `}
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
