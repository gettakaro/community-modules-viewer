'use server';

import fs from 'fs';
import path from 'path';
import { cache } from 'react';

interface Command {
  function: string;
  name: string;
  trigger: string;
  helpText: string;
  arguments?: any[];
}

interface ConfigProperty {
  title: string;
  description?: string;
  type: string;
  default?: any;
  enum?: string[];
}

export interface ModuleData {
  name: string;
  description: string;
  version: string;
  author: string;
  commands?: Command[];
  takaroVersion?: string;
  config?: Record<string, ConfigProperty>;
}

const parseModuleData = (data: any, name?: string): ModuleData => ({
  name: data.name || name || '',
  description: data.description || '',
  version: data.version || '0.0.0',
  author: data.author || 'Unknown',
  commands: data.commands || [],
  takaroVersion: data.takaroVersion || 'latest',
  config: data.config || {},
});

export const getModuleByName = cache(async (name: string): Promise<ModuleData | null> => {
  try {
    const modulesDir = path.join(process.cwd(), 'modules');
    const filePath = path.join(modulesDir, `${name}.json`);
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