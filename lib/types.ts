/**
 * TypeScript interfaces for Takaro module data structures
 * With Zod schemas for runtime validation
 */

import { z } from 'zod';

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
  /** Module author (optional) */
  author?: string;
  /** Supported game (legacy, optional) */
  supportgame?: string;
  /** Supported games array (optional) */
  supportedGames?: string[];
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
 * Zod schema for ArgumentType enum
 */
export const ArgumentTypeSchema = z.nativeEnum(ArgumentType);

/**
 * Zod schema for command arguments
 */
export const CommandArgumentSchema = z.object({
  name: z.string().min(1, 'Argument name cannot be empty'),
  type: ArgumentTypeSchema,
  helpText: z.string(),
  defaultValue: z.union([z.string(), z.number(), z.boolean()]).optional(),
  position: z.number().int().min(0, 'Position must be non-negative'),
});

/**
 * Zod schema for module commands
 */
export const ModuleCommandSchema = z.object({
  function: z.string().min(1, 'Command function cannot be empty'),
  name: z.string().min(1, 'Command name cannot be empty'),
  trigger: z.string().min(1, 'Command trigger cannot be empty'),
  helpText: z.string(),
  arguments: z.array(CommandArgumentSchema).default([]),
});

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
  regex?: string | null;
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
 * Zod schema for hook event types
 */
export const HookEventTypeSchema = z.union([
  z.literal('chat-message'),
  z.literal('player-connected'),
  z.literal('player-disconnected'),
  z.literal('discord-message'),
  z.literal('server-status-changed'),
  z.literal('log'),
  z.literal('entity-killed'),
  z.literal('player-new-ip-detected'),
  z.literal('role-assigned'),
  z.literal('role-removed'),
  z.literal('command-executed'),
  z.string(), // Allow other event types
]);

/**
 * Zod schema for module hooks
 */
export const ModuleHookSchema = z.object({
  function: z.string().min(1, 'Hook function cannot be empty'),
  name: z.string().min(1, 'Hook name cannot be empty'),
  description: z.string().nullable().optional(),
  eventType: HookEventTypeSchema,
  regex: z.string().nullable().optional(),
});

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
 * Zod schema for cron jobs
 */
export const ModuleCronJobSchema = z.object({
  function: z.string().min(1, 'Cron job function cannot be empty'),
  name: z.string().min(1, 'Cron job name cannot be empty'),
  description: z.string().nullable().optional(),
  temporalValue: z.string().min(1, 'Temporal value cannot be empty'),
});

/**
 * Zod schema for module functions
 */
export const ModuleFunctionSchema = z.object({
  function: z.string().min(1, 'Function code cannot be empty'),
  name: z.string().min(1, 'Function name cannot be empty'),
  description: z.string().nullable().optional(),
});

/**
 * Zod schema for module permissions
 */
export const ModulePermissionSchema = z.object({
  canHaveCount: z.boolean(),
  description: z.string(),
  permission: z.string().min(1, 'Permission key cannot be empty'),
  friendlyName: z.string().min(1, 'Friendly name cannot be empty'),
});

/**
 * Module source type
 */
export type ModuleSource = 'community' | 'builtin';

/**
 * Zod schema for module source
 */
export const ModuleSourceSchema = z.union([
  z.literal('community'),
  z.literal('builtin'),
]);

/**
 * Extended module interface with metadata
 */
export interface ModuleWithMeta extends Module {
  /** Source of the module */
  source: ModuleSource;
  /** File path or URL */
  path?: string;
  /** Category of the module (derived from subdirectory structure) */
  category?: string;
}

/**
 * Zod schema for module versions
 */
export const ModuleVersionSchema = z.object({
  tag: z.string().min(1, 'Version tag cannot be empty'),
  description: z.string().default(''),
  configSchema: z.string().default('{}'),
  uiSchema: z.string().default('{}'),
  commands: z.array(ModuleCommandSchema).default([]),
  hooks: z.array(ModuleHookSchema).default([]),
  cronJobs: z.array(ModuleCronJobSchema).default([]),
  functions: z.array(ModuleFunctionSchema).default([]),
  permissions: z.array(ModulePermissionSchema).default([]),
});

/**
 * Zod schema for main module
 */
export const ModuleSchema = z.object({
  name: z.string().min(1, 'Module name cannot be empty'),
  versions: z
    .array(ModuleVersionSchema)
    .min(1, 'Module must have at least one version'),
  takaroVersion: z.string().min(1, 'Takaro version cannot be empty'),
  author: z.string().optional(),
  supportgame: z.string().optional(),
  supportedGames: z.array(z.string()).optional(),
});

/**
 * Zod schema for module with metadata
 */
export const ModuleWithMetaSchema = ModuleSchema.extend({
  source: ModuleSourceSchema,
  path: z.string().optional(),
  category: z.string().optional(),
});

/**
 * Zod-based validation function for modules
 * @param obj - Object to validate
 * @returns Validation result with parsed data or error details
 */
export function validateModule(obj: unknown):
  | {
      success: true;
      data: Module;
    }
  | {
      success: false;
      error: z.ZodError;
    } {
  const result = ModuleSchema.safeParse(obj);
  return result.success
    ? { success: true, data: result.data }
    : { success: false, error: result.error };
}

/**
 * Zod-based validation function for modules with metadata
 * @param obj - Object to validate
 * @returns Validation result with parsed data or error details
 */
export function validateModuleWithMeta(obj: unknown):
  | {
      success: true;
      data: ModuleWithMeta;
    }
  | {
      success: false;
      error: z.ZodError;
    } {
  const result = ModuleWithMetaSchema.safeParse(obj);
  return result.success
    ? { success: true, data: result.data }
    : { success: false, error: result.error };
}

/**
 * Legacy type guard for backward compatibility
 * @deprecated Use validateModule() instead for better error handling
 */
export function isModule(obj: unknown): obj is Module {
  const result = ModuleSchema.safeParse(obj);
  return result.success;
}

/**
 * Legacy type guard for backward compatibility
 * @deprecated Use validateModuleWithMeta() instead for better error handling
 */
export function isModuleVersion(obj: unknown): obj is ModuleVersion {
  const result = ModuleVersionSchema.safeParse(obj);
  return result.success;
}

/**
 * Helper type for module search/filter operations
 */
export interface ModuleSearchResult {
  module: ModuleWithMeta;
  matchedIn: ('name' | 'description' | 'command' | 'permission')[];
}

/**
 * Module validation error details
 */
export interface ModuleValidationError {
  /** Source file path or identifier */
  source: string;
  /** Validation error from Zod */
  error: z.ZodError;
  /** Human-readable error message */
  message: string;
  /** Raw data that failed validation */
  data: unknown;
}

/**
 * Module loading result with error handling
 */
export interface ModuleLoadResult {
  /** Successfully loaded modules */
  modules: ModuleWithMeta[];
  /** Validation errors encountered */
  errors: ModuleValidationError[];
  /** Loading statistics */
  stats: {
    attempted: number;
    successful: number;
    failed: number;
  };
}

/**
 * Format Zod error for human consumption
 */
export function formatValidationError(
  error: z.ZodError,
  source: string,
): string {
  const issues = error.issues
    .map((issue: z.ZodIssue) => {
      const path = issue.path.length > 0 ? ` at ${issue.path.join('.')}` : '';
      return `${issue.message}${path}`;
    })
    .join('; ');

  return `Validation failed in ${source}: ${issues}`;
}

/**
 * Changelog Types
 */

/**
 * Individual changelog entry for a module change
 */
export interface ChangelogEntry {
  /** Name of the module that changed */
  moduleName: string;
  /** Category of the module */
  category: string;
  /** ISO date string of when the change occurred */
  date: string;
  /** User-friendly title summarizing the change */
  title: string;
  /** Detailed description focusing on use cases and user impact */
  description: string;
  /** Git commit hash for reference */
  commitHash: string;
  /** Whether this is a new module or an update */
  isNew: boolean;
}

/**
 * Complete changelog data structure
 */
export interface Changelogs {
  /** Global changelog showing all recent changes */
  global: ChangelogEntry[];
  /** Changelog entries organized by module name */
  byModule: Record<string, ChangelogEntry[]>;
  /** ISO timestamp of when the changelog was generated */
  generatedAt?: string;
}

/**
 * Zod schema for changelog entries
 */
export const ChangelogEntrySchema = z.object({
  moduleName: z.string().min(1, 'Module name cannot be empty'),
  category: z.string().min(1, 'Category cannot be empty'),
  date: z.string().min(1, 'Date cannot be empty'),
  title: z.string().min(1, 'Title cannot be empty'),
  description: z.string().min(1, 'Description cannot be empty'),
  commitHash: z.string().min(1, 'Commit hash cannot be empty'),
  isNew: z.boolean(),
});

/**
 * Zod schema for complete changelogs
 */
export const ChangelogsSchema = z.object({
  global: z.array(ChangelogEntrySchema),
  byModule: z.record(z.array(ChangelogEntrySchema)),
  generatedAt: z.string().optional(),
});

/**
 * Takaro API Client Types
 */

/**
 * Auth check result from Takaro API
 */
export interface AuthCheckResult {
  isAuthenticated: boolean;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

/**
 * Module import result from Takaro API
 */
export interface ImportResult {
  success: boolean;
  id?: string;
  error?: string;
  alreadyExists?: boolean;
}

/**
 * Game server result from Takaro API
 */
export interface GameServerResult {
  success: boolean;
  servers?: GameServer[];
  error?: string;
}

/**
 * Game server information
 */
export interface GameServer {
  id: string;
  name: string;
  gameType: string;
}

/**
 * Authentication state for UI
 */
export type AuthState = 'loading' | 'authenticated' | 'unauthenticated';
