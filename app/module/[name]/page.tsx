import { getModuleByName } from '../../../utils/modules';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { ModuleData } from '../../../utils/modules';
import { ModuleDetails } from './module-details';
import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: { name: string } }) {
  const name = params.name;
  const moduleData = await getModuleByName(name);
  return {
    title: moduleData ? `${moduleData.name} - Takaro Module` : 'Module Not Found',
    description: moduleData?.description || 'Module details page'
  };
}

export default async function Page({ params }: { params: { name: string } }) {
  const name = params.name;
  const moduleData = await getModuleByName(name);

  if (!moduleData) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link 
        href="/"
        className="inline-flex items-center text-primary dark:text-dark-primary hover:underline mb-6"
      >
        <span className="mr-2">←</span>
        Back to Modules
      </Link>

      <ModuleDetails moduleData={moduleData} />
    </div>
  );
}