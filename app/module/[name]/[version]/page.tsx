import { getModuleByName, getModules } from '../../../../utils/modules';
import { ModuleDetails } from './module-details';
import { notFound, redirect } from 'next/navigation';

export default async function ModuleVersionDetailsPage(opts: { 
  params: Promise<{ name: string; version: string } >
}) {
  const params  = await opts.params;
  const moduleData = await getModuleByName(params.name);
  const allModules = await getModules();
  
  if (!moduleData) {
    notFound();
  }
  
  // Find the version index based on the URL parameter
  const versionIndex = moduleData.versions.findIndex(
    v => v.tag === params.version
  );
  
  // If version doesn't exist, redirect to the latest version or show not found
  if (versionIndex === -1) {
  // Find the latest version if available
    const latestVersionIndex = moduleData.versions.findIndex(v => v.tag === "latest");
    if (latestVersionIndex !== -1) {
      redirect(`/module/${params.name}/${moduleData.versions[latestVersionIndex].tag}`);
    } else if (moduleData.versions.length > 0 && moduleData.versions[0].tag) {
      redirect(`/module/${params.name}/${moduleData.versions[0].tag}`);
    } else {
      notFound();
    }
  }

  return (
    <main className="bg-background dark:bg-dark-background min-h-screen pb-16">
      <ModuleDetails 
        moduleData={moduleData} 
        allModules={allModules} 
        initialVersionIndex={versionIndex} 
      />
    </main>
  );
}