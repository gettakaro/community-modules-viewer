'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { ModuleWithMeta, AuthState } from '@/lib/types';
import { ConfigSection } from './ConfigSection';
import { CommandsSection } from './CommandsSection';
import { HooksSection } from './HooksSection';
import { CronJobsSection } from './CronJobsSection';
import { FunctionsSection } from './FunctionsSection';
import { PermissionsSection } from './PermissionsSection';
import { exportModuleAsJSON } from '@/utils/exportUtils';
import { MarkdownRenderer } from './MarkdownRenderer';
import {
  getModuleAuthor,
  getModuleSupportedGame,
  formatAuthorName,
} from '@/utils/moduleUtils';
import {
  checkAuthStatus,
  importModule,
  getDashboardUrl,
} from '@/utils/takaroApi';
import { transformModuleForApi } from '@/utils/moduleTransform';
import { toast } from 'react-hot-toast';
import { InstallModuleModal } from './InstallModuleModal';

export interface ModuleDetailsProps {
  /** Module data to display */
  module: ModuleWithMeta;
  /** Currently selected version tag */
  selectedVersion?: string;
  /** Callback when version is changed */
  onVersionChange?: (version: string) => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * ModuleDetails component for displaying comprehensive module information
 * Integrates all section components to show module data in an organized layout
 */
export function ModuleDetails({
  module,
  selectedVersion,
  onVersionChange,
  className = '',
}: ModuleDetailsProps) {
  // Find the current version to display
  const currentVersion = useMemo(() => {
    if (selectedVersion) {
      return module.versions.find((v) => v.tag === selectedVersion);
    }
    // Default to 'latest' version, or first version if no 'latest' exists
    return (
      module.versions.find((v) => v.tag === 'latest') || module.versions[0]
    );
  }, [module.versions, selectedVersion]);

  // Auth state management
  const [authState, setAuthState] = useState<AuthState>('loading');

  // Import state management
  const [importing, setImporting] = useState(false);
  const [importedModuleId, setImportedModuleId] = useState<string | null>(null);
  const [showInstallModal, setShowInstallModal] = useState(false);

  // Section collapse state management
  const [collapsedSections, setCollapsedSections] = useState<
    Record<string, boolean>
  >({
    config: false,
    commands: false,
    hooks: false,
    cronJobs: false,
    functions: false,
    permissions: false,
  });

  const toggleSection = (sectionName: string) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [sectionName]: !prev[sectionName],
    }));
  };

  // Handle version change
  const handleVersionChange = (version: string) => {
    onVersionChange?.(version);
  };

  // Export functionality
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  // Check authentication status on mount
  useEffect(() => {
    async function checkAuth() {
      try {
        const result = await checkAuthStatus();
        setAuthState(
          result.isAuthenticated ? 'authenticated' : 'unauthenticated',
        );
      } catch (error) {
        console.error('Auth check failed:', error);
        setAuthState('unauthenticated');
      }
    }
    checkAuth();
  }, []);

  // Click outside handler for export menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        exportMenuRef.current &&
        !exportMenuRef.current.contains(event.target as Node)
      ) {
        setExportMenuOpen(false);
      }
    };

    if (exportMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [exportMenuOpen]);

  const handleExportCurrentVersion = async () => {
    if (currentVersion) {
      await exportModuleAsJSON(module, currentVersion);
      setExportMenuOpen(false);
    }
  };

  const handleExportAllVersions = async () => {
    await exportModuleAsJSON(module);
    setExportMenuOpen(false);
  };

  // Import functionality
  const handleImportClick = async () => {
    if (module.source === 'builtin') {
      return; // Button already disabled
    }

    setImporting(true);
    const toastId = toast.loading('Importing module...');

    try {
      // Fetch module JSON from the same source as export uses
      const pathMatch = module.path?.match(/public\/modules\/(.*\.json)$/);
      if (!pathMatch) {
        throw new Error('Invalid module path');
      }

      const response = await fetch(`/modules/${pathMatch[1]}`);
      if (!response.ok) {
        throw new Error('Failed to fetch module data');
      }

      const moduleJson = await response.json();
      const transformedData = transformModuleForApi(moduleJson);

      // Import to Takaro
      const result = await importModule(transformedData);

      if (result.success) {
        if (result.alreadyExists) {
          toast.success('Module already imported to your account!', {
            id: toastId,
          });
        } else {
          toast.success('Module imported successfully!', { id: toastId });
        }
        setImportedModuleId(result.id || null);
        setShowInstallModal(true);
      } else {
        toast.error(`Import failed: ${result.error}`, { id: toastId });
      }
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error(`Import failed: ${err.message || 'Unknown error'}`, {
        id: toastId,
      });
    } finally {
      setImporting(false);
    }
  };

  // Handle click on unauthenticated import button
  const handleUnauthenticatedClick = () => {
    const dashboardUrl = getDashboardUrl();
    toast(
      (t) => (
        <div className="flex flex-col gap-2">
          <p className="font-medium">Login Required</p>
          <p className="text-sm text-takaro-text-secondary">
            You need to log in to your Takaro account to import modules.
          </p>
          <a
            href={`${dashboardUrl}/login`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-takaro-primary hover:underline"
            onClick={() => toast.dismiss(t.id)}
          >
            Open Takaro Login →
          </a>
        </div>
      ),
      {
        duration: 6000,
        icon: '🔒',
      },
    );
  };

  // Handle click on built-in module import button
  const handleBuiltinClick = () => {
    toast(
      "Built-in modules are pre-installed in all Takaro instances. You don't need to import them!",
      {
        duration: 4000,
        icon: 'ℹ️',
      },
    );
  };

  // Calculate section availability and counts
  const sectionStats = useMemo(() => {
    if (!currentVersion) return null;

    return {
      config: {
        available: !!(
          currentVersion.configSchema &&
          currentVersion.configSchema.trim() !== '{}' &&
          currentVersion.configSchema.trim() !== ''
        ),
        count: 1,
      },
      commands: {
        available: currentVersion.commands.length > 0,
        count: currentVersion.commands.length,
      },
      hooks: {
        available: currentVersion.hooks.length > 0,
        count: currentVersion.hooks.length,
      },
      cronJobs: {
        available: currentVersion.cronJobs.length > 0,
        count: currentVersion.cronJobs.length,
      },
      functions: {
        available: currentVersion.functions.length > 0,
        count: currentVersion.functions.length,
      },
      permissions: {
        available: currentVersion.permissions.length > 0,
        count: currentVersion.permissions.length,
      },
    };
  }, [currentVersion]);

  if (!currentVersion) {
    return (
      <div className={`card-takaro p-8 text-center ${className}`}>
        <div className="text-takaro-text-muted">
          <svg
            className="w-16 h-16 mx-auto mb-4 opacity-50"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
          <h2 className="text-xl font-semibold text-takaro-text-primary mb-2">
            Version Not Found
          </h2>
          <p className="text-takaro-text-secondary">
            The requested version could not be found for this module.
          </p>
        </div>
      </div>
    );
  }

  const sourceColors = {
    community: 'badge-takaro-primary',
    builtin: 'badge-takaro-secondary',
  };

  // Get author and supported game
  const author = getModuleAuthor(module);
  const supportedGame = getModuleSupportedGame(module);

  return (
    <div data-testid="module-details" className={`space-y-6 ${className}`}>
      {/* Module Header */}
      <div className="card-takaro">
        <div className="flex flex-col sm:flex-row items-start justify-between mb-4 gap-4">
          <div className="flex-1 w-full sm:mr-4">
            <h1 className="text-xl sm:text-2xl font-bold text-takaro-text-primary mb-2">
              {module.name}
            </h1>

            {/* Author and Supported Game Info */}
            <div className="flex flex-col sm:flex-row gap-2 mb-3">
              {author && (
                <div className="flex items-center gap-1">
                  <svg
                    className="w-4 h-4 text-takaro-text-muted"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  <span className="text-sm text-takaro-text-muted">
                    by{' '}
                    <span className="text-takaro-text-secondary font-medium">
                      {formatAuthorName(author)}
                    </span>
                  </span>
                </div>
              )}
              {supportedGame && (
                <div className="flex items-center gap-1">
                  <svg
                    className="w-4 h-4 text-takaro-text-muted"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="text-sm text-takaro-text-muted">
                    for{' '}
                    <span className="text-takaro-text-secondary font-medium">
                      {supportedGame}
                    </span>
                  </span>
                </div>
              )}
            </div>

            {currentVersion.description && (
              <MarkdownRenderer
                content={currentVersion.description}
                className="text-takaro-text-secondary leading-relaxed"
              />
            )}
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-start gap-4 w-full sm:w-auto">
            <div className="flex flex-col items-start sm:items-end gap-2">
              <span className={sourceColors[module.source]}>
                {module.source}
              </span>
              <span className="text-xs text-takaro-text-muted">
                Takaro {module.takaroVersion}
              </span>
            </div>

            {/* Import Button */}
            <div className="relative">
              {authState === 'loading' && (
                <button
                  disabled
                  className="btn btn-ghost btn-sm"
                  title="Checking authentication..."
                  data-testid="import-button-loading"
                  aria-label="Checking authentication status"
                >
                  <svg
                    className="w-5 h-5 animate-spin"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                </button>
              )}

              {module.source === 'builtin' && authState !== 'loading' && (
                <button
                  onClick={handleBuiltinClick}
                  className="btn btn-ghost btn-sm opacity-50 cursor-help hover:opacity-60 transition-opacity"
                  data-testid="import-button-builtin"
                  aria-label="Click to learn why this module cannot be imported"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  Import to Takaro
                </button>
              )}

              {module.source !== 'builtin' &&
                authState === 'unauthenticated' && (
                  <button
                    onClick={handleUnauthenticatedClick}
                    className="btn btn-ghost btn-sm opacity-50 cursor-help hover:opacity-60 transition-opacity"
                    data-testid="import-button-unauthenticated"
                    aria-label="Click to see login instructions"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    Import to Takaro
                  </button>
                )}

              {module.source !== 'builtin' && authState === 'authenticated' && (
                <button
                  onClick={handleImportClick}
                  disabled={importing}
                  className="btn btn-ghost btn-sm"
                  title={importing ? 'Importing...' : 'Import module to Takaro'}
                  data-testid="import-button-active"
                  aria-label="Import module to Takaro"
                >
                  {importing ? (
                    <svg
                      className="w-5 h-5 animate-spin"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                  )}
                  Import to Takaro
                </button>
              )}
            </div>

            {/* Export Button */}
            <div className="relative" ref={exportMenuRef}>
              <button
                onClick={() => setExportMenuOpen(!exportMenuOpen)}
                data-testid="export-button"
                className="btn btn-ghost btn-sm"
                aria-label="Export module data"
                title="Export module data"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
              </button>

              {/* Export Menu Dropdown */}
              {exportMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-takaro-card border border-takaro-border rounded-lg shadow-lg z-10">
                  <div className="p-2">
                    <button
                      onClick={handleExportCurrentVersion}
                      className="w-full text-left px-3 py-2 text-sm text-takaro-text-primary hover:bg-takaro-card-hover rounded transition-colors"
                    >
                      <div className="flex items-center gap-2">
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
                            d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                          />
                        </svg>
                        <div>
                          <div className="font-medium">
                            Export Current Version
                          </div>
                          <div className="text-xs text-takaro-text-muted">
                            Download {currentVersion.tag} as JSON
                          </div>
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={handleExportAllVersions}
                      className="w-full text-left px-3 py-2 text-sm text-takaro-text-primary hover:bg-takaro-card-hover rounded transition-colors"
                    >
                      <div className="flex items-center gap-2">
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
                            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                          />
                        </svg>
                        <div>
                          <div className="font-medium">Export All Versions</div>
                          <div className="text-xs text-takaro-text-muted">
                            Download complete module data
                          </div>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Version Selector */}
        {module.versions.length > 1 && (
          <div className="border-t border-takaro-border pt-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <label
                htmlFor="version-select"
                className="text-sm font-medium text-takaro-text-primary flex-shrink-0"
              >
                Version:
              </label>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <select
                  id="version-select"
                  data-testid="version-selector"
                  value={currentVersion.tag}
                  onChange={(e) => handleVersionChange(e.target.value)}
                  className="input-takaro text-sm min-w-0 flex-shrink-0 w-full sm:w-auto"
                  aria-label="Select module version"
                >
                  {module.versions.map((version) => (
                    <option key={version.tag} value={version.tag}>
                      {version.tag}
                    </option>
                  ))}
                </select>
                <span className="text-xs text-takaro-text-muted whitespace-nowrap">
                  ({module.versions.length} version
                  {module.versions.length !== 1 ? 's' : ''} available)
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Section Overview */}
        {sectionStats && (
          <div className="border-t border-takaro-border pt-4 mt-4">
            <h3 className="text-sm font-medium text-takaro-text-primary mb-3">
              Components Overview
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {Object.entries(sectionStats).map(([key, stats]) => (
                <div
                  key={key}
                  className={`text-center p-2 rounded border ${
                    stats.available
                      ? 'border-takaro-border bg-takaro-card-hover'
                      : 'border-takaro-border/50 bg-takaro-card opacity-50'
                  }`}
                >
                  <div
                    className={`text-lg font-semibold ${
                      stats.available
                        ? 'text-takaro-primary'
                        : 'text-takaro-text-muted'
                    }`}
                  >
                    {stats.available ? stats.count : 0}
                  </div>
                  <div className="text-xs text-takaro-text-secondary capitalize">
                    {key === 'cronJobs' ? 'Cron Jobs' : key}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Configuration Section */}
      {sectionStats?.config.available && (
        <SectionWrapper
          title="Configuration"
          icon="cog"
          isCollapsed={collapsedSections.config}
          onToggle={() => toggleSection('config')}
          count={1}
        >
          <ConfigSection
            configSchema={currentVersion.configSchema}
            uiSchema={currentVersion.uiSchema}
            defaultExpanded={!collapsedSections.config}
          />
        </SectionWrapper>
      )}

      {/* Commands Section */}
      {sectionStats?.commands.available && (
        <SectionWrapper
          title="Commands"
          icon="terminal"
          isCollapsed={collapsedSections.commands}
          onToggle={() => toggleSection('commands')}
          count={sectionStats.commands.count}
        >
          <CommandsSection
            commands={currentVersion.commands}
            defaultExpanded={false}
          />
        </SectionWrapper>
      )}

      {/* Hooks Section */}
      {sectionStats?.hooks.available && (
        <SectionWrapper
          title="Hooks"
          icon="lightning"
          isCollapsed={collapsedSections.hooks}
          onToggle={() => toggleSection('hooks')}
          count={sectionStats.hooks.count}
        >
          <HooksSection hooks={currentVersion.hooks} defaultExpanded={false} />
        </SectionWrapper>
      )}

      {/* Cron Jobs Section */}
      {sectionStats?.cronJobs.available && (
        <SectionWrapper
          title="Cron Jobs"
          icon="clock"
          isCollapsed={collapsedSections.cronJobs}
          onToggle={() => toggleSection('cronJobs')}
          count={sectionStats.cronJobs.count}
        >
          <CronJobsSection
            cronJobs={currentVersion.cronJobs}
            defaultExpanded={false}
          />
        </SectionWrapper>
      )}

      {/* Functions Section */}
      {sectionStats?.functions.available && (
        <SectionWrapper
          title="Functions"
          icon="code"
          isCollapsed={collapsedSections.functions}
          onToggle={() => toggleSection('functions')}
          count={sectionStats.functions.count}
        >
          <FunctionsSection
            functions={currentVersion.functions}
            defaultExpanded={false}
          />
        </SectionWrapper>
      )}

      {/* Permissions Section */}
      {sectionStats?.permissions.available && (
        <SectionWrapper
          title="Permissions"
          icon="shield"
          isCollapsed={collapsedSections.permissions}
          onToggle={() => toggleSection('permissions')}
          count={sectionStats.permissions.count}
        >
          <PermissionsSection
            permissions={currentVersion.permissions}
            defaultExpanded={false}
          />
        </SectionWrapper>
      )}

      {/* Empty State */}
      {sectionStats &&
        !Object.values(sectionStats).some((stats) => stats.available) && (
          <div className="card-takaro p-8 text-center">
            <div className="text-takaro-text-muted">
              <svg
                className="w-16 h-16 mx-auto mb-4 opacity-50"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h2 className="text-xl font-semibold text-takaro-text-primary mb-2">
                No Components
              </h2>
              <p className="text-takaro-text-secondary">
                This module version doesn't contain any commands, hooks, cron
                jobs, or permissions.
              </p>
            </div>
          </div>
        )}

      {/* Install Module Modal */}
      {showInstallModal && importedModuleId && (
        <InstallModuleModal
          isOpen={showInstallModal}
          onClose={() => setShowInstallModal(false)}
          moduleId={importedModuleId}
          moduleVersion={currentVersion.tag}
        />
      )}
    </div>
  );
}

/**
 * Wrapper component for sections with collapsible functionality
 */
interface SectionWrapperProps {
  title: string;
  icon: 'cog' | 'terminal' | 'lightning' | 'clock' | 'shield' | 'code';
  isCollapsed: boolean;
  onToggle: () => void;
  count: number;
  children: React.ReactNode;
}

function SectionWrapper({
  title,
  icon,
  isCollapsed,
  onToggle,
  count,
  children,
}: SectionWrapperProps) {
  const icons = {
    cog: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
      />
    ),
    terminal: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    ),
    lightning: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 10V3L4 14h7v7l9-11h-7z"
      />
    ),
    clock: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    ),
    shield: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
      />
    ),
    code: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
      />
    ),
  };

  return (
    <div className="card-takaro">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-3 sm:p-4 hover:bg-takaro-card-hover transition-colors focus:outline-none focus:ring-2 focus:ring-takaro-primary rounded-lg"
        aria-expanded={!isCollapsed}
        aria-controls={`section-${title.toLowerCase().replace(' ', '-')}`}
      >
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <svg
            className="w-4 h-4 sm:w-5 sm:h-5 text-takaro-primary flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            {icons[icon]}
          </svg>
          <h2 className="text-base sm:text-lg font-semibold text-takaro-text-primary truncate">
            {title}
          </h2>
          <span className="badge-takaro-secondary text-xs flex-shrink-0">
            {count}
          </span>
        </div>
        <svg
          className={`w-4 h-4 sm:w-5 sm:h-5 text-takaro-text-secondary transition-transform flex-shrink-0 ml-2 ${
            isCollapsed ? '' : 'rotate-180'
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {!isCollapsed && (
        <div
          id={`section-${title.toLowerCase().replace(' ', '-')}`}
          className="border-t border-takaro-border"
        >
          {children}
        </div>
      )}
    </div>
  );
}

export default ModuleDetails;
