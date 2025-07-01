/**
 * TypeScript interfaces for Takaro module data structures
 */

/**
 * Main module interface containing all versions
 */
export interface Module {
  /** Unique module name/identifier */
  name: string;
  /** Array of module versions */
  versions: ModuleVersion[];
  /** Takaro version compatibility */
  takaroVersion: string;
}

/**
 * Individual module version with all components
 */
export interface ModuleVersion {
  /** Version tag (e.g., "latest", "1.0.0") */
  tag: string;
  /** Module description in markdown format */
  description: string;
  /** JSON Schema for configuration as a string */
  configSchema: string;
  /** UI Schema for configuration form as a string */
  uiSchema: string;
  /** Array of commands this module provides */
  commands: ModuleCommand[];
  /** Array of hooks for game events */
  hooks: ModuleHook[];
  /** Array of scheduled cron jobs */
  cronJobs: ModuleCronJob[];
  /** Array of reusable functions */
  functions: ModuleFunction[];
  /** Array of permissions this module defines */
  permissions: ModulePermission[];
}

/**
 * Module command that players can execute
 */
export interface ModuleCommand {
  /** JavaScript function code as a string */
  function: string;
  /** Internal name of the command */
  name: string;
  /** Trigger word players use to execute the command */
  trigger: string;
  /** Help text displayed to players */
  helpText: string;
  /** Array of command arguments */
  arguments: CommandArgument[];
}

/**
 * Command argument definition
 */
export interface CommandArgument {
  /** Argument name */
  name: string;
  /** Argument data type */
  type: ArgumentType;
  /** Help text for the argument */
  helpText: string;
  /** Default value if not provided */
  defaultValue?: string | number | boolean;
  /** Position in the argument list */
  position: number;
}

/**
 * Valid argument types for commands
 */
export enum ArgumentType {
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  PLAYER = 'player',
}

/**
 * Module hook for responding to game events
 */
export interface ModuleHook {
  /** JavaScript function code as a string */
  function: string;
  /** Internal name of the hook */
  name: string;
  /** Optional description */
  description?: string | null;
  /** Type of event this hook responds to */
  eventType: HookEventType;
  /** Optional regex pattern for log-based hooks */
  regex?: string;
}

/**
 * Valid hook event types
 */
export type HookEventType =
  | 'chat-message'
  | 'player-connected'
  | 'player-disconnected'
  | 'discord-message'
  | 'server-status-changed'
  | 'log'
  | 'entity-killed'
  | 'player-new-ip-detected'
  | 'role-assigned'
  | 'role-removed'
  | 'command-executed'
  | string; // Allow other event types for extensibility

/**
 * Scheduled cron job
 */
export interface ModuleCronJob {
  /** JavaScript function code as a string */
  function: string;
  /** Internal name of the cron job */
  name: string;
  /** Optional description */
  description?: string | null;
  /** Cron expression (e.g., every 5 minutes) */
  temporalValue: string;
}

/**
 * Reusable function that can be imported by other module components
 */
export interface ModuleFunction {
  /** JavaScript function code as a string */
  function: string;
  /** Function name for imports */
  name: string;
  /** Optional description */
  description?: string | null;
}

/**
 * Permission definition
 */
export interface ModulePermission {
  /** Whether this permission can have a count/level */
  canHaveCount: boolean;
  /** Description of what this permission allows */
  description: string;
  /** Permission key used in code */
  permission: string;
  /** User-friendly name for the permission */
  friendlyName: string;
}

/**
 * Module source type
 */
export type ModuleSource = 'community' | 'builtin';

/**
 * Extended module interface with metadata
 */
export interface ModuleWithMeta extends Module {
  /** Source of the module */
  source: ModuleSource;
  /** File path or URL */
  path?: string;
}

/**
 * Type guard to check if an object is a valid Module
 */
export function isModule(obj: unknown): obj is Module {
  if (!obj || typeof obj !== 'object') return false;
  const mod = obj as Record<string, unknown>;

  return (
    typeof mod.name === 'string' &&
    Array.isArray(mod.versions) &&
    typeof mod.takaroVersion === 'string'
  );
}

/**
 * Type guard to check if an object is a valid ModuleVersion
 */
export function isModuleVersion(obj: unknown): obj is ModuleVersion {
  if (!obj || typeof obj !== 'object') return false;
  const version = obj as Record<string, unknown>;

  return (
    typeof version.tag === 'string' &&
    typeof version.description === 'string' &&
    typeof version.configSchema === 'string' &&
    typeof version.uiSchema === 'string' &&
    Array.isArray(version.commands) &&
    Array.isArray(version.hooks) &&
    Array.isArray(version.cronJobs) &&
    Array.isArray(version.functions) &&
    Array.isArray(version.permissions)
  );
}

/**
 * Helper type for module search/filter operations
 */
export interface ModuleSearchResult {
  module: ModuleWithMeta;
  matchedIn: ('name' | 'description' | 'command' | 'permission')[];
}
