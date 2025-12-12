import { redirect } from 'next/navigation';
import { getModuleByName, getAllModuleNames } from '@/utils/moduleLoader';

interface ModulePageProps {
  params: Promise<{
    name: string;
  }>;
}

export async function generateStaticParams() {
  const moduleNames = await getAllModuleNames();
  // URL-encode names with special characters for static export compatibility
  return moduleNames.map((name) => ({
    name: encodeURIComponent(name),
  }));
}

export default async function ModulePage({ params }: ModulePageProps) {
  const { name } = await params;
  const decodedName = decodeURIComponent(name);
  const moduleData = await getModuleByName(decodedName);

  if (!moduleData || moduleData.versions.length === 0) {
    redirect('/');
  }

  // Find the latest version (assuming 'latest' tag or first in array)
  const latestVersion =
    moduleData.versions.find((v) => v.tag === 'latest') ||
    moduleData.versions[0];

  // Redirect to the specific version page (use encoded name for URL)
  redirect(`/module/${encodeURIComponent(decodedName)}/${encodeURIComponent(latestVersion.tag)}`);
}
