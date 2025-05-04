import { test, expect } from '@playwright/test';
import { readdirSync } from 'fs';
import { getBuiltins } from '../utils/getBuiltins';
import { ModuleData } from '../utils/moduleData';

const targetUrl = process.env.TARGET_URL || 'http://localhost:3000';

const moduleFiles = readdirSync('modules').filter(file => file.endsWith('.json'));

test.describe('Can browse to all community modules', () => {
  for (const file of moduleFiles) {
    const moduleName = file.replace('.json', '');
    test(`Can browse to ${moduleName}`, async ({ page }) => {
      await page.goto(targetUrl, { waitUntil: 'networkidle' });

      await page.getByRole('link', { name: moduleName, exact: true }).click();
      const downloadPromise = page.waitForEvent('download');
      await page.getByRole('button', { name: 'Download module data as JSON' }).click();
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toBe(`${moduleName}-latest.json`);
      await expect(page.getByRole('heading', { name: moduleName, exact: true })).toHaveText(moduleName);
    });
  }
});

test.describe('Can browse to all builtin modules', () => {
  let moduleFiles: ModuleData[] = [];

  test.beforeAll(async () => {
    moduleFiles = await getBuiltins()
  });

  test('Can browse to all builtins', async ({ page }) => {
    for (const { name, versions } of moduleFiles) {
      await page.goto(targetUrl, { waitUntil: 'networkidle' });
      await page.getByRole('link', { name, exact: true }).click();
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(name);
    }

  });
});