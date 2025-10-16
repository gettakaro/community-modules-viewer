import { ModuleWithMeta } from '@/lib/types';

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
 * Get supported game for the module
 */
export function getModuleSupportedGame(
  module: ModuleWithMeta,
): string | undefined {
  // If supportgame is explicitly provided, use it
  if (module.supportgame) {
    return module.supportgame;
  }

  // For now, assume all modules support 7 Days to Die since that's the primary game
  // This could be made more sophisticated by analyzing module content
  return '7 Days to Die';
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
 */
export function getUniqueSupportedGames(modules: ModuleWithMeta[]): string[] {
  const games = new Set<string>();

  modules.forEach((module) => {
    const game = getModuleSupportedGame(module);
    if (game) {
      games.add(game);
    }
  });

  return Array.from(games).sort((a, b) => a.localeCompare(b));
}
