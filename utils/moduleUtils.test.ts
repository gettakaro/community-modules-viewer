import { describe, expect, it } from 'vitest';
import { getModuleSupportedGame, getUniqueSupportedGames } from './moduleUtils';
import { ModuleWithMeta } from '@/lib/types';

const moduleBase: Omit<ModuleWithMeta, 'name' | 'supportedGames'> = {
  source: 'community',
  takaroVersion: '1.0.0',
  path: '/path/to/module.json',
  versions: [],
};

describe('moduleUtils', () => {
  describe('DayZ game support', () => {
    it('normalizes DayZ aliases to the canonical display name', () => {
      expect(
        getModuleSupportedGame({
          ...moduleBase,
          name: 'dayz-module',
          supportedGames: ['dayz'],
        }),
      ).toBe('DayZ');

      expect(
        getModuleSupportedGame({
          ...moduleBase,
          name: 'day-z-module',
          supportedGames: ['day z'],
        }),
      ).toBe('DayZ');
    });

    it('includes DayZ once in the unique supported games list', () => {
      const games = getUniqueSupportedGames([
        {
          ...moduleBase,
          name: 'dayz-commands',
          supportedGames: ['DayZ'],
        },
        {
          ...moduleBase,
          name: 'dayz-discord',
          supportedGames: ['dayz'],
        },
      ]);

      expect(games).toContain('DayZ');
      expect(games.filter((game) => game === 'DayZ')).toHaveLength(1);
    });
  });
});
