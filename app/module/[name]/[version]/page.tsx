import { notFound } from 'next/navigation';
import {
  getModuleByName,
  getAllModuleVersionPaths,
} from '@/utils/moduleLoader';
import { ModuleDetails } from '@/components/ModuleDetails';

interface ModuleVersionPageProps {
  params: Promise<{
    name: string;
    version: string;
  }>;
}

export async function generateStaticParams() {
  const paths = await getAllModuleVersionPaths();
  return paths;
}

export async function generateMetadata({ params }: ModuleVersionPageProps) {
  const { name, version } = await params;
  return {
    title: `${name} v${version} - Community Modules Viewer`,
    description: `View details for ${name} module version ${version}`,
  };
}

export default async function ModuleVersionPage({
  params,
}: ModuleVersionPageProps) {
  const { name, version } = await params;
  const moduleData = await getModuleByName(name);

  if (!moduleData) {
    notFound();
  }

  const moduleVersion = moduleData.versions.find((v) => v.tag === version);

  if (!moduleVersion) {
    notFound();
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <ModuleDetails module={moduleData} selectedVersion={version} />
    </div>
  );
}
