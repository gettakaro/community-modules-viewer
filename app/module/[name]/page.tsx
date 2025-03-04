// app/module/[name]/page.tsx
import { getModuleByName, getModules } from '../../../utils/modules';
import { ModuleDetails } from './module-details';
import { notFound } from 'next/navigation';

export default async function ModuleDetailsPage(opts: { params: Promise<{ name: string }> }) {
  const params = await opts.params
  const moduleData = await getModuleByName(params.name);
  const allModules = await getModules();
  
  if (!moduleData) {
    notFound();
  }

  return (
    <main className="bg-background dark:bg-dark-background min-h-screen pb-16">
      <ModuleDetails moduleData={moduleData} allModules={allModules} />
    </main>
  );
}

// For dynamic metadata generation
export async function generateMetadata(opts: { params: Promise<{ name: string }> }) {
  const params = await opts.params
  const moduleData = await getModuleByName(params.name);
  
  if (!moduleData) {
    return {
      title: 'Module Not Found',
    };
  }
  
  return {
    title: `${moduleData.name} - Community Modules`,
    description: moduleData.description || `Details for ${moduleData.name} Takaro module`,
  };
}