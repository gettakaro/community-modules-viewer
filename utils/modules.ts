import fs from 'fs';
import path from 'path';

interface Command {
  function: string;
  name: string;
  trigger: string;
  helpText: string;
  arguments?: any[];
}

export interface ModuleData {
  name: string;
  description: string;
  version: string;
  author: string;
  commands?: Command[];
}

export function getModules(): ModuleData[] {
  const modulesDir = path.join(process.cwd(), 'modules');
  const moduleFiles = fs.readdirSync(modulesDir);

  return moduleFiles
    .filter(file => file.endsWith('.json'))
    .map(file => {
      const filePath = path.join(modulesDir, file);
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const moduleData = JSON.parse(fileContent);
      return {
        name: moduleData.name || path.basename(file, '.json'),
        description: moduleData.description || '',
        version: moduleData.version || '0.0.0',
        author: moduleData.author || 'Unknown',
        commands: moduleData.commands || [],
      };
    });
}