'use server';

import fs from 'fs';
import path from 'path';
import { cache } from 'react';

export interface ModuleData {
  name: string;
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

interface Permission {
  name: string;
  description?: string;
}

const parseModuleData = (data: any, name?: string): ModuleData => ({
  rawData: JSON.stringify(data),
  name: data.name || name || '',
  description: data.description || '',
  versions: data.versions.map((version: any) => ({
    tag: version.tag,
    description: version.description || '',
    configSchema: version.configSchema || '',
    hooks: version.hooks || [],
    commands: version.commands || [],
    cronJobs: version.cronJobs || [],
    functions: version.functions || [],
    permissions: version.permissions || [],
  })),
});

export const getModuleByName = cache(async (name: string): Promise<ModuleData | null> => {
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

  return moduleFiles
    .filter(file => file.endsWith('.json'))
    .map(file => {
      const filePath = path.join(modulesDir, file);
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const moduleData = JSON.parse(fileContent);
      const name = path.basename(file, '.json');
      return parseModuleData(moduleData, name);
    });
});