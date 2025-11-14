import { loadAllModules } from '@/utils/moduleLoader';
import { MobileLayoutWrapper } from '@/components/MobileLayoutWrapper';
import { HomeContent } from '@/components/HomeContent';
import fs from 'fs';
import path from 'path';
import { Changelogs, ChangelogsSchema } from '@/lib/types';

async function loadChangelogs(): Promise<Changelogs | null> {
  try {
    const changelogPath = path.join(process.cwd(), 'data', 'changelogs.json');

    // Check if changelog file exists
    if (!fs.existsSync(changelogPath)) {
      console.warn('Changelog file not found at:', changelogPath);
      return null;
    }

    const changelogData = fs.readFileSync(changelogPath, 'utf-8');
    const parsed = JSON.parse(changelogData);

    // Validate with Zod schema
    const validated = ChangelogsSchema.safeParse(parsed);

    if (!validated.success) {
      console.error('Changelog validation failed:', validated.error);
      return null;
    }

    return validated.data;
  } catch (error) {
    console.error('Error loading changelogs:', error);
    return null;
  }
}

export default async function Home() {
  // Get all modules for the sidebar
  const modules = await loadAllModules();

  // Load changelogs
  const changelogs = await loadChangelogs();

  return (
    <MobileLayoutWrapper modules={modules}>
      <HomeContent modules={modules} changelogs={changelogs} />
    </MobileLayoutWrapper>
  );
}
