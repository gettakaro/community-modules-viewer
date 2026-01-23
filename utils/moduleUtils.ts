import { ModuleWithMeta } from '@/lib/types';

/**
 * Game name normalization map
 * Maps common variations to canonical names
 */
const GAME_NAME_MAP: Record<string, string> = {
  '7dtd': '7 Days to Die',
  '7d2d': '7 Days to Die',
  '7 days to die': '7 Days to Die',
  '7days': '7 Days to Die',
  sevendaystodie: '7 Days to Die',
  hytale: 'Hytale',
  rust: 'Rust',
  minecraft: 'Minecraft',
  other: 'All',
};

/**
 * Normalize a game name to its canonical form
 */
function normalizeGameName(game: string): string {
  const lower = game.toLowerCase().trim();
  return GAME_NAME_MAP[lower] || game;
}

/**
 * Extract author name from module name if not explicitly provided
 * Many modules follow the pattern "AuthorName_ModuleName"
 */
export function getModuleAuthor(module: ModuleWithMeta): string | undefined {
  // If author is explicitly provided, use it
  if (module.author) {
    return module.author;
  }

  // Try to extract author from module name
  // Pattern: "Author_ModuleName" or "Author-ModuleName"
  const nameMatch = module.name.match(/^([^_-]+)[_-]/);
  if (nameMatch) {
    const potentialAuthor = nameMatch[1];
    // Only return if it looks like an author name (not too long, contains letters)
    if (potentialAuthor.length <= 20 && /[a-zA-Z]/.test(potentialAuthor)) {
      return potentialAuthor;
    }
  }

  return undefined;
}

/**
 * Check if a module supports all games (universal module)
 */
export function moduleSupportsAllGames(module: ModuleWithMeta): boolean {
  if (module.supportedGames) {
    return module.supportedGames.some((g) => g.toLowerCase().trim() === 'all');
  }
  return false;
}

/**
 * Get supported game for the module
 * Returns the first specific game (not "all") from the module's supported games
 */
export function getModuleSupportedGame(
  module: ModuleWithMeta,
): string | undefined {
  // Check supportedGames array first (newer format)
  if (module.supportedGames && module.supportedGames.length > 0) {
    // Find first non-"all" game
    for (const game of module.supportedGames) {
      if (game.toLowerCase().trim() !== 'all') {
        return normalizeGameName(game);
      }
    }
    // If only "all" is present, return undefined (universal module)
    return undefined;
  }

  // Fall back to legacy supportgame field
  if (module.supportgame) {
    return normalizeGameName(module.supportgame);
  }

  return undefined;
}

/**
 * Format author name for display
 */
export function formatAuthorName(author: string): string {
  // Capitalize first letter and handle common patterns
  return author.charAt(0).toUpperCase() + author.slice(1);
}

/**
 * Get all unique authors from a list of modules
 * Normalizes author names (case-insensitive, trimmed) to prevent duplicates
 * like "limon" and "Limon" from appearing as separate authors
 */
export function getUniqueAuthors(modules: ModuleWithMeta[]): string[] {
  // Map of normalized name -> original name (to preserve casing)
  const authorMap = new Map<string, string>();

  modules.forEach((module) => {
    const author = getModuleAuthor(module);
    if (author) {
      // Normalize: lowercase and trim spaces
      const normalized = author.toLowerCase().trim();

      // Only add if we haven't seen this normalized version before
      // This preserves the first encountered capitalization
      if (!authorMap.has(normalized)) {
        authorMap.set(normalized, author);
      }
    }
  });

  // Return sorted by the original (display) names
  return Array.from(authorMap.values()).sort((a, b) =>
    a.toLowerCase().localeCompare(b.toLowerCase()),
  );
}

/**
 * Get all unique supported games from a list of modules
 * Excludes "all" since it's not a specific game
 */
export function getUniqueSupportedGames(modules: ModuleWithMeta[]): string[] {
  const games = new Set<string>();

  modules.forEach((module) => {
    // Check supportedGames array for all games (not just first)
    if (module.supportedGames) {
      module.supportedGames.forEach((game) => {
        const lower = game.toLowerCase().trim();
        // Skip "all" - it's not a real game
        if (lower !== 'all') {
          games.add(normalizeGameName(game));
        }
      });
    } else if (module.supportgame) {
      // Fall back to legacy field
      const lower = module.supportgame.toLowerCase().trim();
      if (lower !== 'all') {
        games.add(normalizeGameName(module.supportgame));
      }
    }
  });

  return Array.from(games).sort((a, b) => a.localeCompare(b));
}
