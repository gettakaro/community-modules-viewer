import { notFound } from 'next/navigation';
import {
  getModuleByName,
  getAllModuleVersionPaths,
} from '@/utils/moduleLoader';
import { ModuleDetails } from '@/components/ModuleDetails';
import { TakaroContextBanner } from '@/components/TakaroContextBanner';
import fs from 'fs';
import path from 'path';
import { Changelogs, ChangelogsSchema } from '@/lib/types';
import { buildModuleJsonLd, buildModuleMetadata } from '@/utils/seo';

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
  const moduleData = await getModuleByName(decodedName);
  const moduleVersion = moduleData?.versions.find(
    (v) => v.tag === decodedVersion,
  );

  if (!moduleData || !moduleVersion) {
    return {
      title: `${decodedName} - Takaro Module`,
      description: 'Explore Takaro community modules for game servers.',
    };
  }

  return buildModuleMetadata(moduleData, moduleVersion);
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
    <div className="mx-auto max-w-6xl p-4 sm:p-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildModuleJsonLd(moduleData, moduleVersion)),
        }}
      />
      <TakaroContextBanner />
      <ModuleDetails
        module={moduleData}
        selectedVersion={decodedVersion}
        moduleChanges={moduleChanges}
      />
    </div>
  );
}
