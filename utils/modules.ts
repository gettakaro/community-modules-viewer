'use server';

import fs from 'fs';
import path from 'path';
import { cache } from 'react';
import { getBuiltins } from './getBuiltins';
import { ModuleData, parseModuleData } from './moduleData';

const cachedGetBuiltins = cache(getBuiltins);

export const getModuleByName = cache(async (name: string): Promise<ModuleData | null> => {
  // Check if it's a builtin module first
  const builtinModules = await cachedGetBuiltins();
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

  const builtinModules = await cachedGetBuiltins();
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