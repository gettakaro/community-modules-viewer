import { notFound } from 'next/navigation';
import {
  getModuleByName,
  getAllModuleVersionPaths,
} from '@/utils/moduleLoader';
import { ModuleDetails } from '@/components/ModuleDetails';
import fs from 'fs';
import path from 'path';
import { Changelogs, ChangelogsSchema } from '@/lib/types';

interface ModuleVersionPageProps {
  params: Promise<{
    name: string;
    version: string;
  }>;
}

async function loadChangelogs(): Promise<Changelogs | null> {
  try {
    const changelogPath = path.join(process.cwd(), 'data', 'changelogs.json');

    if (!fs.existsSync(changelogPath)) {
      return null;
    }

    const changelogData = fs.readFileSync(changelogPath, 'utf-8');
    const parsed = JSON.parse(changelogData);
    const validated = ChangelogsSchema.safeParse(parsed);

    return validated.success ? validated.data : null;
  } catch (error) {
    console.error('Error loading changelogs:', error);
    return null;
  }
}

export async function generateStaticParams() {
  const paths = await getAllModuleVersionPaths();
  // URL-encode names and versions with special characters for static export compatibility
  return paths.map((p) => ({
    name: encodeURIComponent(p.name),
    version: encodeURIComponent(p.version),
  }));
}

export async function generateMetadata({ params }: ModuleVersionPageProps) {
  const { name, version } = await params;
  const decodedName = decodeURIComponent(name);
  const decodedVersion = decodeURIComponent(version);
  return {
    title: `${decodedName} v${decodedVersion} - Community Modules Viewer`,
    description: `View details for ${decodedName} module version ${decodedVersion}`,
  };
}

export default async function ModuleVersionPage({
  params,
}: ModuleVersionPageProps) {
  const { name, version } = await params;
  const decodedName = decodeURIComponent(name);
  const decodedVersion = decodeURIComponent(version);
  const moduleData = await getModuleByName(decodedName);

  if (!moduleData) {
    notFound();
  }

  const moduleVersion = moduleData.versions.find(
    (v) => v.tag === decodedVersion,
  );

  if (!moduleVersion) {
    notFound();
  }

  // Load changelogs and get changes for this specific module
  const changelogs = await loadChangelogs();
  const moduleChanges = changelogs?.byModule[decodedName] || [];

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <ModuleDetails
        module={moduleData}
        selectedVersion={decodedVersion}
        moduleChanges={moduleChanges}
      />
    </div>
  );
}
