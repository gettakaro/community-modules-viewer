import type { Metadata } from 'next';
import { ModuleVersion, ModuleWithMeta } from '@/lib/types';

const SITE_URL = 'https://modules.takaro.io';
const DEFAULT_DESCRIPTION =
  'Explore Takaro modules for game server administration, Discord integration, player rewards, moderation, and community automation.';

function encodePathSegment(value: string) {
  return encodeURIComponent(value);
}

function getSupportedGame(module: ModuleWithMeta) {
  const games = module.supportedGames?.filter(Boolean);
  if (games && games.length > 0) {
    return games[0];
  }

  return module.supportgame || null;
}

function cleanMarkdown(markdown: string) {
  return markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^\s{0,3}#{1,6}\s+/gm, '')
    .replace(/[*_~>#|]/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function markdownToMetaDescription(markdown: string, maxLength = 155) {
  const text = cleanMarkdown(markdown);

  if (!text) {
    return DEFAULT_DESCRIPTION;
  }

  if (text.length <= maxLength) {
    return text;
  }

  const truncated = text.slice(0, maxLength - 3);
  const endsOnWordBoundary = /\s/.test(text.charAt(maxLength - 3));
  const lastSpace = truncated.lastIndexOf(' ');
  const safeText =
    endsOnWordBoundary || lastSpace <= 40
      ? truncated
      : truncated.slice(0, lastSpace);

  return `${safeText.trimEnd()}...`;
}

export function buildModuleUrl(module: ModuleWithMeta, version: ModuleVersion) {
  return `/module/${encodePathSegment(module.name)}/${encodePathSegment(version.tag)}`;
}

export function buildModuleTitle(
  module: ModuleWithMeta,
  version: ModuleVersion,
) {
  const game = getSupportedGame(module);
  const versionLabel = version.tag === 'latest' ? '' : ` v${version.tag}`;
  const context = game ? ` for ${game}` : '';

  return `${module.name}${versionLabel}${context} - Takaro Module`;
}

export function buildModuleMetadata(
  module: ModuleWithMeta,
  version: ModuleVersion,
): Metadata {
  const title = buildModuleTitle(module, version);
  const description = markdownToMetaDescription(version.description);
  const url = buildModuleUrl(module, version);

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}${url}`,
      type: 'website',
      siteName: 'Takaro Modules',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  };
}

export function buildModuleJsonLd(
  module: ModuleWithMeta,
  version: ModuleVersion,
) {
  const url = `${SITE_URL}${buildModuleUrl(module, version)}`;
  const title = buildModuleTitle(module, version);
  const description = markdownToMetaDescription(version.description);
  const supportedGame = getSupportedGame(module);

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${url}#webpage`,
        url,
        name: title,
        description,
        about: {
          '@type': 'SoftwareApplication',
          name: module.name,
          applicationCategory: 'Game server management module',
          operatingSystem: 'Web',
          ...(supportedGame ? { gamePlatform: supportedGame } : {}),
        },
        isPartOf: {
          '@type': 'WebSite',
          name: 'Takaro Modules',
          url: SITE_URL,
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Modules',
            item: SITE_URL,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: module.category || 'Module',
            item: SITE_URL,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: module.name,
            item: url,
          },
        ],
      },
    ],
  };
}
