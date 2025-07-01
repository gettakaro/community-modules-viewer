import { redirect } from 'next/navigation';
import { getAllModuleNames } from '@/utils/moduleLoader';

export default async function Home() {
  // Get all module names
  const moduleNames = await getAllModuleNames();

  // Redirect to the first module if available
  if (moduleNames.length > 0) {
    redirect(`/module/${moduleNames[0]}`);
  }

  // Fallback if no modules are available
  return (
    <main className="container mx-auto p-4">
      <div className="card bg-takaro-card shadow-xl">
        <div className="card-body">
          <h1 className="card-title text-3xl text-takaro-primary">
            Community Modules Viewer
          </h1>
          <p className="text-gray-400">No modules available.</p>
        </div>
      </div>
    </main>
  );
}
