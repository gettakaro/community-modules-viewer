import { test, expect } from '@playwright/test';
import { readdirSync } from 'fs';
import { getBuiltins } from '../utils/getBuiltins';

const targetUrl = process.env.TARGET_URL || 'http://localhost:3000';

const moduleFiles = readdirSync('modules');

test.describe('Can browse to all community modules', () => {
  for (const file of moduleFiles) {
    const moduleName = file.replace('.json', '');
    test(`Can browse to ${moduleName}`, async ({ page }) => {
      await page.goto(targetUrl);

      await page.getByRole('link', { name: moduleName, exact: true }).click();
      const downloadPromise = page.waitForEvent('download');
      await page.getByRole('button', { name: 'Download module data as JSON' }).click();
      const download = await downloadPromise;
    });
  }
});

test.describe('Can browse to all builtin modules', () => {
  let moduleFiles = [];

  test.beforeAll(async () => {
    moduleFiles = await getBuiltins()
  });

  test('Can browse to all builtins', async ({ page }) => {
    for (const { name } of moduleFiles) {
      await page.goto(targetUrl);
      await page.getByRole('link', { name, exact: true }).click();
      await page.getByRole('button', { name: 'Built-in module' });
    }

  });
});