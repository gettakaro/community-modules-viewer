import { getModuleByName } from '../../../utils/modules';
import { redirect } from 'next/navigation';
import { notFound } from 'next/navigation';

export default async function ModuleDetailsPage(opts: { 
  params: Promise<{ name: string }> 
}) {
  const params  = await opts.params;
  const moduleData = await getModuleByName(params.name);
  
  if (!moduleData) {
    notFound();
  }

  // Find the latest version or use the first available version
  const latestVersionIndex = moduleData.versions.findIndex(v => v.tag === "latest");
  const redirectVersion = latestVersionIndex !== -1 
    ? moduleData.versions[latestVersionIndex].tag 
    : (moduleData.versions[0]?.tag);
  
  // Redirect to the versioned route
  redirect(`/module/${params.name}/${redirectVersion}`);
}