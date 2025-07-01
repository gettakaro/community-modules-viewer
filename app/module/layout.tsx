import { loadAllModules } from '@/utils/moduleLoader';
import { ModuleSidebar } from '@/components/ModuleSidebar';

export default async function ModuleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ name?: string }>;
}) {
  // Load all modules for the sidebar
  const modules = await loadAllModules();

  // Extract the selected module name from params
  const { name: selectedModule } = await params;

  return (
    <div className="min-h-screen bg-takaro-background">
      {/* Sidebar */}
      <ModuleSidebar modules={modules} selectedModule={selectedModule} />

      {/* Main Content Area */}
      <div className="main-content-with-sidebar">{children}</div>
    </div>
  );
}
