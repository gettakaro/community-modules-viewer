import fs from 'fs';
import path from 'path';
import { describe, expect, it, vi } from 'vitest';
import sitemap from '@/app/sitemap';

vi.mock('@/utils/moduleLoader', () => ({
  loadAllModules: vi.fn().mockResolvedValue([
    {
      name: 'test-module',
      versions: [{ tag: 'latest' }, { tag: '1.0.0' }],
    },
  ]),
}));

describe('robots.txt', () => {
  it('allows crawling and advertises the sitemap', () => {
    const robotsPath = path.join(process.cwd(), 'public', 'robots.txt');
    const robots = fs.readFileSync(robotsPath, 'utf-8');

    expect(robots).toContain('User-agent: *');
    expect(robots).toContain('Allow: /');
    expect(robots).toContain('Sitemap: https://modules.takaro.io/sitemap.xml');
  });
});

describe('sitemap', () => {
  it('lists concrete module version pages without redirect-only module pages', async () => {
    const urls = await sitemap();
    const locs = urls.map((entry) => entry.url);

    expect(locs).toContain(
      'https://modules.takaro.io/module/test-module/latest',
    );
    expect(locs).toContain(
      'https://modules.takaro.io/module/test-module/1.0.0',
    );
    expect(locs).not.toContain('https://modules.takaro.io/module/test-module');
  });
});
