import { describe, expect, it } from 'vitest';
import {
  buildModuleJsonLd,
  buildModuleMetadata,
  markdownToMetaDescription,
} from './seo';
import { ModuleWithMeta } from '@/lib/types';

const module: ModuleWithMeta = {
  name: 'dayzDiscordIntegration',
  takaroVersion: '0.7.2',
  author: 'Mad',
  supportedGames: ['DayZ'],
  source: 'community',
  category: 'integration',
  versions: [
    {
      tag: 'latest',
      description:
        '# DayZ Discord integration\n\nConnect a DayZ server to Discord with game chat relay, player join and leave alerts, server status updates, and death notifications.',
      configSchema: '{}',
      uiSchema: '{}',
      commands: [],
      hooks: [],
      cronJobs: [],
      functions: [],
      permissions: [],
    },
  ],
};

describe('markdownToMetaDescription', () => {
  it('turns markdown into a compact plain-text snippet', () => {
    expect(
      markdownToMetaDescription(
        '# Heading\n\n**Strong** module copy for `commands`, hooks, and [links](https://example.com).',
      ),
    ).toBe('Heading Strong module copy for commands, hooks, and links.');
  });

  it('truncates long snippets without cutting a word in half', () => {
    const snippet = markdownToMetaDescription(
      'Takaro modules help game server owners automate Discord updates, player rewards, access control, moderation, and admin workflows for active communities.',
      90,
    );

    expect(snippet.length).toBeLessThanOrEqual(90);
    expect(snippet).toBe(
      'Takaro modules help game server owners automate Discord updates, player rewards, access...',
    );
  });
});

describe('buildModuleMetadata', () => {
  it('builds use-case focused module page metadata', () => {
    const metadata = buildModuleMetadata(module, module.versions[0]);

    expect(metadata.title).toBe(
      'dayzDiscordIntegration for DayZ - Takaro Module',
    );
    expect(metadata.description).toContain('Connect a DayZ server to Discord');
    expect(metadata.openGraph?.url).toBe(
      'https://modules.takaro.io/module/dayzDiscordIntegration/latest',
    );
    expect(metadata.alternates?.canonical).toBe(
      '/module/dayzDiscordIntegration/latest',
    );
  });
});

describe('buildModuleJsonLd', () => {
  it('describes the visible module page with WebPage and breadcrumb schema', () => {
    const graph = buildModuleJsonLd(module, module.versions[0]);

    expect(graph['@context']).toBe('https://schema.org');
    expect(graph['@graph']).toMatchObject([
      {
        '@type': 'WebPage',
        name: 'dayzDiscordIntegration for DayZ - Takaro Module',
        about: {
          '@type': 'SoftwareApplication',
          applicationCategory: 'Game server management module',
          name: 'dayzDiscordIntegration',
        },
      },
      {
        '@type': 'BreadcrumbList',
      },
    ]);
  });
});
