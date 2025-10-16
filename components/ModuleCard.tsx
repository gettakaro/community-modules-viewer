import { ModuleWithMeta } from '@/lib/types';
import { MarkdownRenderer } from './MarkdownRenderer';

export interface ModuleCardProps {
  /** Module data to display */
  module: ModuleWithMeta;
  /** Optional click handler for card interaction */
  onClick?: (module: ModuleWithMeta) => void;
  /** Whether this card is currently selected/active */
  isSelected?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * ModuleCard component for displaying module information in a card format
 * Uses Takaro design system styling for consistent appearance
 */
export function ModuleCard({
  module,
  onClick,
  isSelected = false,
  className = '',
}: ModuleCardProps) {
  const handleClick = () => {
    onClick?.(module);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick?.(module);
    }
  };

  const sourceColors = {
    community: 'badge-takaro-primary',
    builtin: 'badge-takaro-secondary',
  };

  const versionCount = module.versions.length;
  const latestVersion = module.versions.find((v) => v.tag === 'latest');
  const displayDescription =
    latestVersion?.description || module.versions[0]?.description || '';

  return (
    <div
      data-testid="module-link"
      className={`
        card-takaro card-takaro-hover cursor-pointer
        ${isSelected ? 'border-takaro-primary bg-takaro-card-hover' : ''}
        ${onClick ? 'focus:outline-none focus:ring-2 focus:ring-takaro-primary' : ''}
        ${className}
      `}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={onClick ? 0 : -1}
      role={onClick ? 'button' : 'article'}
      aria-label={`Module: ${module.name}`}
    >
      {/* Header with name and badges */}
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-base font-semibold text-takaro-text-primary truncate flex-1 mr-2">
          {module.name}
        </h3>
        {/* Only show badges if not in sidebar */}
        {!className.includes('module-card-sidebar') && (
          <div className="flex gap-1 flex-shrink-0">
            {module.category && (
              <span className="badge-takaro-secondary text-xs">
                {module.category
                  .split('-')
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(' ')}
              </span>
            )}
            <span className={`${sourceColors[module.source]}`}>
              {module.source}
            </span>
          </div>
        )}
      </div>

      {/* Description */}
      {displayDescription && (
        <MarkdownRenderer
          content={displayDescription}
          className="text-takaro-text-secondary text-sm mb-3"
          truncate={true}
          maxLines={2}
        />
      )}

      {/* Footer with version info and components count */}
      <div className="flex items-center justify-between text-xs text-takaro-text-muted">
        <span className="flex items-center gap-1">
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
              d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.997 1.997 0 013 12V7a4 4 0 014-4z"
            />
          </svg>
          {versionCount} version{versionCount !== 1 ? 's' : ''}
        </span>

        <span className="flex items-center gap-1">
          <ComponentsCount module={module} />
        </span>
      </div>

      {/* Takaro version compatibility */}
      <div className="mt-2 pt-2 border-t border-takaro-border">
        <span className="text-xs text-takaro-text-muted">
          Takaro {module.takaroVersion}
        </span>
      </div>
    </div>
  );
}

/**
 * Helper component to display total components count across all versions
 */
function ComponentsCount({ module }: { module: ModuleWithMeta }) {
  const totalComponents = module.versions.reduce((total, version) => {
    return (
      total +
      version.commands.length +
      version.hooks.length +
      version.cronJobs.length +
      version.functions.length +
      version.permissions.length
    );
  }, 0);

  if (totalComponents === 0) {
    return (
      <span className="text-takaro-text-muted">
        <svg
          className="w-4 h-4 inline"
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
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        No components
      </span>
    );
  }

  return (
    <span title="Total components across all versions">
      <svg
        className="w-4 h-4 inline"
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
          d="M19 11H5m14-5v10a2 2 0 01-2 2H7a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2z"
        />
      </svg>
      {totalComponents} component{totalComponents !== 1 ? 's' : ''}
    </span>
  );
}

export default ModuleCard;
