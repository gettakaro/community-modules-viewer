import { loadAllModules } from '@/utils/moduleLoader';
import { MobileLayoutWrapper } from '@/components/MobileLayoutWrapper';

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
    <MobileLayoutWrapper modules={modules} selectedModule={selectedModule}>
      {children}
    </MobileLayoutWrapper>
  );
}
