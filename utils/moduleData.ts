export interface ModuleData {
  name: string;
  isBuiltin: boolean;
  description?: string;
  versions: ModuleVersion[];
  rawData: string;
}

interface ModuleVersion {
  tag: string;
  description?: string;
  configSchema?: string;
  hooks?: Hook[];
  commands?: Command[];
  cronJobs?: CronJob[];
  functions?: Function[];
  permissions?: Permission[];
}

interface Hook {
  name: string;
  description: string;
  eventType: string;
  function: string;
}

interface Command {
  trigger: string;
  name: string;
  description: string;
  helpText?: string;
  function: string;
}

interface CronJob {
  name: string;
  description: string;
  schedule: string;
  function: string;
}

interface Function {
  name: string;
  description: string;
  function: string;
}

export interface Permission {
  friendlyName: string;
  permission: string;
  description?: string;
  canHaveCount: boolean;
}

interface WithName {
  name: string;
}

export function sortByName(a: WithName, b: WithName) {
  if (!a.name || !b.name) return 0;
  return a.name.localeCompare(b.name);
}

export const parseModuleData = (data: any, name?: string): ModuleData => ({
  rawData: JSON.stringify(data),
  name: data.name || name || '',
  isBuiltin: data.isBuiltin || false,
  description: data.description || '',
  versions: data.versions.map((version: any) => ({
    tag: version.tag,
    description: version.description || '',
    configSchema: version.configSchema || '',
    hooks: (version.hooks || []).sort(sortByName),
    commands: (version.commands || []).sort(sortByName),
    cronJobs: (version.cronJobs || []).sort(sortByName),
    functions: (version.functions || []).sort(sortByName),
    permissions: (version.permissions || []).sort(sortByName),
  })).sort((a, b) => {
    // Sort versions by tag, 'latest' at top
    if (a.tag === "latest") return -1;
    if (b.tag === "latest") return 1;
    return a.tag > b.tag ? -1 : 1;
  }),
});