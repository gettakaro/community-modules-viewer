'use client';

import React from 'react';
import { ModulePermission } from '@/lib/types';

export interface PermissionsSectionProps {
  /** Array of module permissions to display */
  permissions: ModulePermission[];
  /** Additional CSS classes */
  className?: string;
  /** Whether sections should be expanded by default */
  defaultExpanded?: boolean;
}

/**
 * PermissionsSection component for displaying module permissions with their details
 * Shows permission keys, friendly names, descriptions, and count capabilities
 * Groups permissions logically and follows Takaro design patterns
 */
export function PermissionsSection({
  permissions,
  className = '',
  defaultExpanded: _defaultExpanded = false,
}: PermissionsSectionProps) {
  /**
   * Group permissions by common prefix for better organization
   * @param permissions - Array of permissions to group
   * @returns Object with grouped permissions
   */
  const groupPermissionsByPrefix = (
    permissions: ModulePermission[],
  ): Record<string, ModulePermission[]> => {
    const groups = permissions.reduce(
      (groups, permission) => {
        // Extract first part of permission key as category (e.g., "SHOP" from "SHOP.MANAGE_ITEMS")
        const parts = permission.permission.split('.');
        const prefix = parts.length > 1 ? parts[0] : 'General';

        if (!groups[prefix]) {
          groups[prefix] = [];
        }
        groups[prefix].push(permission);
        return groups;
      },
      {} as Record<string, ModulePermission[]>,
    );

    // Sort permissions within each group by key
    Object.keys(groups).forEach((key) => {
      groups[key].sort((a, b) => a.permission.localeCompare(b.permission));
    });

    return groups;
  };

  /**
   * Get icon for permission group based on prefix
   * @param prefix - Permission group prefix
   * @returns JSX element for group icon
   */
  const getGroupIcon = (prefix: string) => {
    const iconMap: Record<string, React.ReactElement> = {
      ADMIN: (
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
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
      ),
      SHOP: (
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
            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
          />
        </svg>
      ),
      PLAYER: (
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
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
      ECONOMY: (
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
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
          />
        </svg>
      ),
      SERVER: (
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
            d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"
          />
        </svg>
      ),
    };

    return (
      iconMap[prefix] || (
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
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
      )
    );
  };

  /**
   * Extract sub-permission from full permission key
   * @param permission - Full permission key
   * @param prefix - Permission prefix
   * @returns Sub-permission part
   */
  const getSubPermission = (permission: string, prefix: string): string => {
    if (prefix === 'General') {
      return permission;
    }
    return permission.startsWith(prefix + '.')
      ? permission.substring(prefix.length + 1)
      : permission;
  };

  // Handle empty state
  if (!permissions || permissions.length === 0) {
    return (
      <section
        className={`space-y-4 ${className}`}
        aria-labelledby="permissions-section-title"
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
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-takaro-text-primary mb-2">
            No Permissions Defined
          </h3>
          <p className="text-takaro-text-secondary text-sm max-w-md mx-auto">
            This module doesn't define any custom permissions. It may use
            Takaro's built-in permissions or operate without special access
            controls.
          </p>
        </div>
      </section>
    );
  }

  const groupedPermissions = groupPermissionsByPrefix(permissions);
  const sortedGroups = Object.keys(groupedPermissions).sort((a, b) => {
    // Sort "General" last, others alphabetically
    if (a === 'General') return 1;
    if (b === 'General') return -1;
    return a.localeCompare(b);
  });

  return (
    <section
      className={`space-y-6 ${className}`}
      aria-labelledby="permissions-section-title"
    >
      <div className="space-y-4">
        <h2
          id="permissions-section-title"
          className="text-base font-semibold text-takaro-text-primary border-b border-takaro-border pb-2"
        >
          Permissions ({permissions.length})
        </h2>
        <p className="text-takaro-text-secondary text-sm">
          These permissions control who can access different features of this
          module. Administrators can assign these permissions to roles, allowing
          fine-grained access control.
        </p>
      </div>

      <div className="space-y-8">
        {sortedGroups.map((group) => (
          <div key={group} className="space-y-4">
            {/* Group Header */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-takaro-text-primary">
                {getGroupIcon(group)}
                <h3 className="text-base font-semibold">
                  {group === 'General'
                    ? 'General Permissions'
                    : `${group} Permissions`}
                </h3>
              </div>
              <span className="badge-takaro-secondary text-xs">
                {groupedPermissions[group].length} permission
                {groupedPermissions[group].length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Permissions in Group */}
            <div className="grid gap-4">
              {groupedPermissions[group].map((permission, index) => (
                <article
                  key={`${permission.permission}-${index}`}
                  className="card-takaro space-y-3"
                  aria-labelledby={`permission-${group}-${index}-title`}
                >
                  {/* Permission Header */}
                  <div className="flex items-start justify-between flex-wrap gap-2">
                    <div className="flex-1 min-w-0">
                      <h4
                        id={`permission-${group}-${index}-title`}
                        className="text-base font-semibold text-takaro-text-primary"
                      >
                        {permission.friendlyName}
                      </h4>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <code className="badge-takaro-primary font-mono text-xs">
                          {permission.permission}
                        </code>
                        <span className="text-takaro-text-muted text-xs">
                          Permission Key
                        </span>
                        {permission.canHaveCount && (
                          <span className="badge-takaro-success text-xs">
                            Countable
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Permission Description */}
                  <div className="bg-takaro-card/50 rounded-md p-3">
                    <h5 className="text-sm font-medium text-takaro-text-primary mb-1">
                      Description
                    </h5>
                    <p className="text-sm text-takaro-text-secondary">
                      {permission.description}
                    </p>
                  </div>

                  {/* Permission Details */}
                  <div className="bg-takaro-card/50 rounded-md p-3">
                    <h5 className="text-sm font-medium text-takaro-text-primary mb-2 flex items-center gap-2">
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
                      Permission Details
                    </h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-takaro-text-muted">
                          Full Key:
                        </span>
                        <code className="text-xs bg-takaro-card border border-takaro-border rounded px-2 py-1">
                          {permission.permission}
                        </code>
                      </div>
                      {group !== 'General' && (
                        <div className="flex items-center justify-between">
                          <span className="text-takaro-text-muted">
                            Sub-permission:
                          </span>
                          <code className="text-xs bg-takaro-card border border-takaro-border rounded px-2 py-1">
                            {getSubPermission(permission.permission, group)}
                          </code>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-takaro-text-muted">
                          Can Have Count:
                        </span>
                        <span
                          className={`text-xs ${permission.canHaveCount ? 'text-takaro-success' : 'text-takaro-text-secondary'}`}
                        >
                          {permission.canHaveCount ? 'Yes' : 'No'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-takaro-text-muted">
                          Category:
                        </span>
                        <span className="text-takaro-text-secondary">
                          {group}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Count Capability Info */}
                  {permission.canHaveCount && (
                    <div className="bg-takaro-success/10 border border-takaro-success/20 rounded-md p-3">
                      <div className="flex items-start gap-2">
                        <svg
                          className="w-4 h-4 text-takaro-success flex-shrink-0 mt-0.5"
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
                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                          />
                        </svg>
                        <div className="text-sm">
                          <h6 className="font-medium text-takaro-success mb-1">
                            Countable Permission
                          </h6>
                          <p className="text-takaro-text-secondary">
                            This permission supports numeric values/levels. For
                            example, you could grant someone "10" of this
                            permission to limit their usage or set permission
                            levels.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </article>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Permissions help text */}
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
              About Module Permissions
            </h4>
            <p className="text-takaro-text-secondary">
              Permissions control access to module features and functionality.
              Each permission has a<strong> unique key</strong> for
              identification, a <strong>friendly name</strong> for display, and
              a <strong>description</strong> explaining what it allows. Some
              permissions are
              <strong> countable</strong>, meaning they can have numeric values
              or limits assigned. Administrators assign these permissions to
              user roles to control who can use different module features.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default PermissionsSection;
