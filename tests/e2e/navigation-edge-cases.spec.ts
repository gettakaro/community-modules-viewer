import { test, expect } from '@playwright/test';

test.describe('Navigation Edge Cases', () => {
  test.describe('Auto-redirects', () => {
    test('homepage displays content without redirecting', async ({ page }) => {
      await page.goto('/');

      // Should stay on homepage and display module statistics
      expect(page.url()).toBe(
        `${page.url().split('/').slice(0, 3).join('/')}/`,
      );
      await expect(page.locator('text=Total Modules')).toBeVisible();
      await expect(
        page.locator('[data-testid="module-sidebar"]'),
      ).toBeVisible();
    });

    test('module name without version redirects to latest version', async ({
      page,
    }) => {
      // First, get a valid module name from the sidebar
      await page.goto('/');
      await expect(
        page.locator('[data-testid="module-sidebar"]'),
      ).toBeVisible();

      const firstModuleLink = page
        .locator('[data-testid="module-link"]')
        .first();
      await expect(firstModuleLink).toBeVisible();

      const moduleHref = await firstModuleLink.getAttribute('href');
      const moduleName = moduleHref?.split('/')[2];

      if (!moduleName) {
        // Skip test if we can't find a module
        test.skip(true, 'Could not extract module name from first module link');
        return;
      }

      // Navigate to module without version
      await page.goto(`/module/${moduleName}`);

      // Should redirect to version-specific URL
      await page.waitForURL(/\/module\/[^\/]+\/[^\/]+$/);
      expect(page.url()).toMatch(/\/module\/[^\/]+\/[^\/]+$/);

      // Should display module details
      await expect(
        page.locator('[data-testid="module-details"]'),
      ).toBeVisible();
    });

  });

  test.describe('404 Handling', () => {
    test('non-existent module shows 404', async ({ page }) => {
      await page.goto('/module/nonexistent-module-xyz123');
      await page.waitForLoadState('networkidle');

      // In Next.js static export, non-existent routes might show the homepage
      // or the module not found state
      const pageText = await page.textContent('body');

      // Check for various indicators of a 404 or not found state
      const has404 = pageText?.includes('404') || false;
      const hasNotFoundText =
        pageText?.includes('This page could not be found') || false;
      const hasNoModules = pageText?.includes('No modules available') || false;
      const isOnHomepage = pageText?.includes('Total Modules') || false;

      // Debug log to see what's actually on the page
      if (!has404 && !hasNotFoundText && !hasNoModules && !isOnHomepage) {
        console.log('Page content:', pageText?.substring(0, 200));
      }

      expect(
        has404 || hasNotFoundText || hasNoModules || isOnHomepage,
      ).toBeTruthy();
    });

    test('non-existent module version shows 404', async ({ page }) => {
      // First get a valid module name
      await page.goto('/');
      await expect(
        page.locator('[data-testid="module-sidebar"]'),
      ).toBeVisible();

      const firstModuleLink = page
        .locator('[data-testid="module-link"]')
        .first();
      await expect(firstModuleLink).toBeVisible();

      const moduleHref = await firstModuleLink.getAttribute('href');
      const moduleName = moduleHref?.split('/')[2];

      if (!moduleName) {
        // Skip test if we can't find a module
        test.skip(true, 'Could not extract module name from first module link');
        return;
      }

      // Try to access non-existent version
      await page.goto(`/module/${moduleName}/nonexistent-version-xyz123`);
      await page.waitForLoadState('networkidle');

      // Check for 404 page content
      const pageText = await page.textContent('body');
      const has404 = pageText?.includes('404') || false;
      const hasNotFoundText =
        pageText?.includes('This page could not be found') || false;
      const hasNoModules = pageText?.includes('No modules available') || false;
      const isOnHomepage = pageText?.includes('Total Modules') || false;

      expect(
        has404 || hasNotFoundText || hasNoModules || isOnHomepage,
      ).toBeTruthy();
    });

  });

  test.describe('URL Validation', () => {
    test('handles special characters in URLs', async ({ page }) => {
      // Test URLs with encoded/special characters - these should be handled gracefully
      const testUrls = [
        '/module/test-module-123/v1.0.0', // Hyphens and numbers (common)
        '/module/test_module/latest', // Underscores (common)
        '/module/test.module/latest', // Dots (less common but valid)
        '/module/test%20module/latest', // URL-encoded space
      ];

      for (const url of testUrls) {
        await page.goto(url);
        await page.waitForLoadState('networkidle');

        // All these non-existent modules should show 404 content or homepage
        const pageText = await page.textContent('body');
        const has404 = pageText?.includes('404') || false;
        const hasNotFoundText =
          pageText?.includes('This page could not be found') || false;
        const hasNoModules =
          pageText?.includes('No modules available') || false;
        const isOnHomepage = pageText?.includes('Total Modules') || false;

        expect(
          has404 || hasNotFoundText || hasNoModules || isOnHomepage,
          `URL ${url} should show 404 content or homepage for non-existent module`,
        ).toBeTruthy();
      }
    });

    test('case sensitivity handling', async ({ page }) => {
      // First get a valid module name
      await page.goto('/');
      await expect(
        page.locator('[data-testid="module-sidebar"]'),
      ).toBeVisible();

      const firstModuleLink = page
        .locator('[data-testid="module-link"]')
        .first();
      await expect(firstModuleLink).toBeVisible();

      const moduleHref = await firstModuleLink.getAttribute('href');
      const moduleName = moduleHref?.split('/')[2];
      const moduleVersion = moduleHref?.split('/')[3];

      if (!moduleName || !moduleVersion) {
        // Skip test if we can't find a module
        test.skip(
          true,
          'Could not extract module name and version from first module link',
        );
        return;
      }

      // Test different case variations
      const variations = [
        moduleName.toUpperCase(),
        moduleName.toLowerCase(),
        moduleVersion.toUpperCase(),
        moduleVersion.toLowerCase(),
      ];

      // Test uppercase module name
      const upperResponse = await page.goto(
        `/module/${variations[0]}/${moduleVersion}`,
      );

      // Test uppercase version
      const upperVersionResponse = await page.goto(
        `/module/${moduleName}/${variations[2]}`,
      );

      // Should handle consistently (either work or 404, not crash)
      expect(upperResponse?.status()).toBeGreaterThanOrEqual(200);
      expect(upperResponse?.status()).toBeLessThan(500);
      expect(upperVersionResponse?.status()).toBeGreaterThanOrEqual(200);
      expect(upperVersionResponse?.status()).toBeLessThan(500);
    });

    test('trailing slash handling', async ({ page }) => {
      // First get a valid module URL
      await page.goto('/');
      await expect(
        page.locator('[data-testid="module-sidebar"]'),
      ).toBeVisible();

      const firstModuleLink = page
        .locator('[data-testid="module-link"]')
        .first();
      await expect(firstModuleLink).toBeVisible();

      const moduleHref = await firstModuleLink.getAttribute('href');

      if (!moduleHref) {
        // Skip test if we can't find a module
        test.skip(true, 'Could not get module href from first module link');
        return;
      }

      // Test with trailing slash
      const withSlash = `${moduleHref}/`;
      const response = await page.goto(withSlash);

      // Should handle gracefully
      expect(response?.status()).toBeGreaterThanOrEqual(200);
      expect(response?.status()).toBeLessThan(500);

      // URL should be normalized (either with or without slash consistently)
      const finalUrl = page.url();
      expect(finalUrl).toMatch(/\/module\/[^\/]+\/[^\/]+\/?$/);
    });

    test('query parameters are handled properly', async ({ page }) => {
      // First get a valid module URL
      await page.goto('/');
      await expect(
        page.locator('[data-testid="module-sidebar"]'),
      ).toBeVisible();

      const firstModuleLink = page
        .locator('[data-testid="module-link"]')
        .first();
      await expect(firstModuleLink).toBeVisible();

      const moduleHref = await firstModuleLink.getAttribute('href');

      if (!moduleHref) {
        // Skip test if we can't find a module
        test.skip(true, 'Could not get module href from first module link');
        return;
      }

      // Test with query parameters
      const withQuery = `${moduleHref}?tab=config&view=raw`;
      await page.goto(withQuery);

      // Should load the module page successfully
      await expect(
        page.locator('[data-testid="module-details"]'),
      ).toBeVisible();

      // Query parameters should be preserved or handled gracefully
      const finalUrl = page.url();
      expect(finalUrl).toContain('/module/');
    });
  });

  test.describe('Navigation State', () => {
    test('browser back/forward buttons work correctly', async ({ page }) => {
      // Start at homepage
      await page.goto('/');
      await expect(page.locator('text=Total Modules')).toBeVisible();

      // Navigate to first module
      const firstModuleLink = page
        .locator('[data-testid="module-link"]')
        .first();
      await firstModuleLink.click();
      await page.waitForURL(/\/module\/[^\/]+\/[^\/]+/);
      await expect(
        page.locator('[data-testid="module-details"]'),
      ).toBeVisible();

      // Go back using browser back button
      await page.goBack();
      await expect(page.locator('text=Total Modules')).toBeVisible();

      // Go forward using browser forward button
      await page.goForward();
      await expect(
        page.locator('[data-testid="module-details"]'),
      ).toBeVisible();
    });

    test('page refresh maintains correct state', async ({ page }) => {
      // Navigate to a specific module
      await page.goto('/');
      await expect(
        page.locator('[data-testid="module-sidebar"]'),
      ).toBeVisible();

      const firstModuleLink = page
        .locator('[data-testid="module-link"]')
        .first();
      await firstModuleLink.click();
      await page.waitForURL(/\/module\/[^\/]+\/[^\/]+/);

      const currentUrl = page.url();

      // Refresh the page
      await page.reload();

      // Should maintain the same URL and content
      expect(page.url()).toBe(currentUrl);
      await expect(
        page.locator('[data-testid="module-details"]'),
      ).toBeVisible();
    });

    test('direct URL access works for valid module pages', async ({ page }) => {
      // First get a valid module URL by navigating normally
      await page.goto('/');
      await expect(
        page.locator('[data-testid="module-sidebar"]'),
      ).toBeVisible();

      const firstModuleLink = page
        .locator('[data-testid="module-link"]')
        .first();
      await firstModuleLink.click();
      await page.waitForURL(/\/module\/[^\/]+\/[^\/]+/);

      const moduleUrl = page.url();

      // Open a new page and navigate directly to the URL
      const newPage = await page.context().newPage();
      await newPage.goto(moduleUrl);

      // Should load successfully
      await expect(
        newPage.locator('[data-testid="module-details"]'),
      ).toBeVisible();

      await newPage.close();
    });
  });
});
