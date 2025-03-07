'use server';

import fs from 'fs';
import path from 'path';
import { cache } from 'react';

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
  eventType: string;
  function: string;
}

interface Command {
  trigger: string;
  name: string;
  helpText?: string;
  function: string;
}

interface CronJob {
  name: string;
  schedule: string;
  function: string;
}

interface Function {
  name: string;
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

function sortByName(a: WithName, b: WithName) {
  if (!a.name || !b.name) return 0;
  return a.name.localeCompare(b.name);
}

const parseModuleData = (data: any, name?: string): ModuleData => ({
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

const getBuiltins = cache(async (): Promise<ModuleData[]> => {
  const res = await fetch('https://raw.githubusercontent.com/gettakaro/takaro/refs/heads/development/packages/web-docs/docs/modules/modules.json');
  const modules = await res.json();
  return modules.map((mod: any) => parseModuleData({ ...mod, isBuiltin: true })).sort((a, b) => a.name.localeCompare(b.name));
});

export const getModuleByName = cache(async (name: string): Promise<ModuleData | null> => {
  // Check if it's a builtin module first
  const builtinModules = await getBuiltins();
  const builtinModule = builtinModules.find(mod => mod.name === name);
  if (builtinModule) {
    return builtinModule;
  }

  // Otherwise, try and find it in the modules directory
  try {
    const modulesDir = path.join(process.cwd(), 'modules');
    const filePath = path.join(modulesDir, `${name.replaceAll('%20', ' ')}.json`);
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const moduleData = JSON.parse(fileContent);
    return parseModuleData(moduleData, name);
  } catch (error) {
    return null;
  }
});

export const getModules = cache(async (): Promise<ModuleData[]> => {
  const modulesDir = path.join(process.cwd(), 'modules');
  const moduleFiles = fs.readdirSync(modulesDir);

  const builtinModules = await getBuiltins();
  const community = moduleFiles
    .filter(file => file.endsWith('.json'))
    .map(file => {
      const filePath = path.join(modulesDir, file);
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const moduleData = JSON.parse(fileContent);
      const name = path.basename(file, '.json');
      return parseModuleData(moduleData, name);
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  return [...builtinModules, ...community];
});