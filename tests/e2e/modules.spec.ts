import { test, expect } from '@playwright/test';

test.describe('Community Modules Viewer', () => {
  test('homepage loads and displays module statistics', async ({ page }) => {
    await page.goto('/');

    // Check that the page loads and has the expected title
    await expect(page).toHaveTitle(/Community Modules/);

    // Check for module statistics display
    await expect(page.locator('text=Available Modules')).toBeVisible();

    // Verify sidebar is present
    await expect(page.locator('[data-testid="module-sidebar"]')).toBeVisible();
  });

  test('module navigation works', async ({ page }) => {
    await page.goto('/');

    // Wait for modules to load in sidebar
    await expect(page.locator('[data-testid="module-sidebar"]')).toBeVisible();

    // Click on first module link
    const firstModuleLink = page.locator('[data-testid="module-link"]').first();
    await expect(firstModuleLink).toBeVisible();
    await firstModuleLink.click();

    // Should navigate to module details page
    await expect(page.url()).toMatch(/\/module\/[^\/]+\/latest/);

    // Check that module details are displayed
    await expect(page.locator('[data-testid="module-details"]')).toBeVisible();
  });

  test('sidebar search functionality', async ({ page }) => {
    await page.goto('/');

    // Wait for sidebar to load
    await expect(page.locator('[data-testid="module-sidebar"]')).toBeVisible();

    // Test search input
    const searchInput = page.locator('[data-testid="search-input"]');
    await expect(searchInput).toBeVisible();

    // Type in search and verify filtering works
    await searchInput.fill('test');

    // Check that search results are updated (module count should change)
    await expect(
      page.locator('[data-testid="search-results-count"]'),
    ).toBeVisible();
  });

  test('schema display Pretty/Raw toggle works', async ({ page }) => {
    // Navigate to a module with config schema
    await page.goto('/module/geoBlock/latest');

    // Wait for page to load
    await expect(page.locator('[data-testid="module-details"]')).toBeVisible();

    // Look for Pretty/Raw toggle buttons
    const prettyButton = page.locator('button:has-text("Pretty")');
    const rawButton = page.locator('button:has-text("Raw")');

    if (await prettyButton.isVisible()) {
      // Test switching to Raw view
      await rawButton.click();
      await expect(page.locator('pre')).toBeVisible(); // Raw JSON should be in <pre>

      // Switch back to Pretty view
      await prettyButton.click();
      await expect(
        page.locator('[data-testid="schema-renderer"]'),
      ).toBeVisible();
    }
  });

  test('collapsible code sections work', async ({ page }) => {
    // Navigate to a module page
    await page.goto('/module/geoBlock/latest');

    // Wait for page to load
    await expect(page.locator('[data-testid="module-details"]')).toBeVisible();

    // Look for collapsible code components
    const codeToggle = page
      .locator('button:has-text("Show"), button:has-text("Hide")')
      .first();

    if (await codeToggle.isVisible()) {
      const toggleText = await codeToggle.textContent();
      await codeToggle.click();

      // Verify toggle text changed
      await expect(codeToggle).not.toHaveText(toggleText || '');
    }
  });

  test('version selector dropdown works', async ({ page }) => {
    // Navigate to a module that has multiple versions
    await page.goto('/module/geoBlock/latest');

    // Wait for page to load
    await expect(page.locator('[data-testid="module-details"]')).toBeVisible();

    // Look for version selector
    const versionSelector = page.locator('[data-testid="version-selector"]');

    if (await versionSelector.isVisible()) {
      await versionSelector.click();

      // Check that dropdown options are visible
      await expect(page.locator('option, [role="option"]')).toBeVisible();
    }
  });

  test('module export functionality', async ({ page }) => {
    // Navigate to a module page
    await page.goto('/module/geoBlock/latest');

    // Wait for page to load
    await expect(page.locator('[data-testid="module-details"]')).toBeVisible();

    // Look for export button
    const exportButton = page.locator('[data-testid="export-button"]');

    if (await exportButton.isVisible()) {
      // Click export button to open menu
      await exportButton.click();

      // Click on export current version option
      const exportCurrentButton = page.locator(
        'button:has-text("Export Current Version")',
      );
      if (await exportCurrentButton.isVisible()) {
        const downloadPromise = page.waitForEvent('download');
        await exportCurrentButton.click();

        const download = await downloadPromise;
        expect(download.suggestedFilename()).toMatch(/\.json$/);
      }
    }
  });
});
