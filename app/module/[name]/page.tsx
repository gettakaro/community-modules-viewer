import { redirect } from 'next/navigation';
import { getModuleByName, getAllModuleNames } from '@/utils/moduleLoader';

interface ModulePageProps {
  params: Promise<{
    name: string;
  }>;
}

export async function generateStaticParams() {
  const moduleNames = await getAllModuleNames();
  return moduleNames.map((name) => ({
    name,
  }));
}

export default async function ModulePage({ params }: ModulePageProps) {
  const { name } = await params;
  const moduleData = await getModuleByName(name);

  if (!moduleData || moduleData.versions.length === 0) {
    redirect('/');
  }

  // Find the latest version (assuming 'latest' tag or first in array)
  const latestVersion =
    moduleData.versions.find((v) => v.tag === 'latest') ||
    moduleData.versions[0];

  // Redirect to the specific version page
  redirect(`/module/${name}/${latestVersion.tag}`);
}
