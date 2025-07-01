import { notFound } from 'next/navigation';
import {
  getModuleByName,
  getAllModuleVersionPaths,
} from '@/utils/moduleLoader';

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

  // For now, render a simple placeholder
  // Later this will use the ModuleDetails component
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">{moduleData.name}</h1>
        <div className="flex items-center gap-4">
          <span className="badge badge-primary">{version}</span>
          <span className="badge badge-secondary">{moduleData.source}</span>
        </div>
      </div>

      <div className="prose prose-invert max-w-none">
        <h2>Description</h2>
        <p>{moduleVersion.description || 'No description available.'}</p>

        <h2>Module Information</h2>
        <ul>
          <li>Commands: {moduleVersion.commands.length}</li>
          <li>Hooks: {moduleVersion.hooks.length}</li>
          <li>Cron Jobs: {moduleVersion.cronJobs.length}</li>
          <li>Permissions: {moduleVersion.permissions.length}</li>
        </ul>

        <h2>Takaro Version</h2>
        <p>{moduleData.takaroVersion}</p>
      </div>
    </div>
  );
}
