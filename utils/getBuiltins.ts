import { ModuleData, parseModuleData } from "./moduleData";

export const getBuiltins = async (): Promise<ModuleData[]> => {
  const res = await fetch('https://raw.githubusercontent.com/gettakaro/takaro/refs/heads/development/packages/web-docs/docs/modules/modules.json');
  const modules = await res.json();
  return modules.map((mod: any) => parseModuleData({ ...mod, isBuiltin: true })).sort((a, b) => a.name.localeCompare(b.name));
};