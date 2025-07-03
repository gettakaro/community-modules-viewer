import { loadAllModules } from '@/utils/moduleLoader';
import { MobileLayoutWrapper } from '@/components/MobileLayoutWrapper';
import { HomeContent } from '@/components/HomeContent';

export default async function Home() {
  // Get all modules for the sidebar
  const modules = await loadAllModules();

  return (
    <MobileLayoutWrapper modules={modules}>
      <HomeContent modules={modules} />
    </MobileLayoutWrapper>
  );
}
