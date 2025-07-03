import { test, expect } from '@playwright/test';

test.describe('Community Modules Viewer', () => {
  test('homepage loads and displays module statistics', async ({ page }) => {
    await page.goto('/');

    // Check that the page loads and has the expected title
    await expect(page).toHaveTitle(/Community Modules/);

    // Check for module statistics display
    await expect(page.locator('text=Total Modules')).toBeVisible();

    // Verify sidebar is present
    await expect(page.locator('[data-testid="module-sidebar"]')).toBeVisible();

    // Check for category section
    await expect(
      page.locator('[data-testid="category-section-title"]'),
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="category-section-title"]'),
    ).toHaveText('Browse by Category');

    // Check for category cards grid
    await expect(
      page.locator('[data-testid="category-cards-grid"]'),
    ).toBeVisible();

    // Check that at least one category card is visible
    const categoryCards = page.locator('[data-testid^="category-card-"]');
    const categoryCount = await categoryCards.count();
    expect(categoryCount).toBeGreaterThan(0);
  });

  test('module navigation works', async ({ page }) => {
    await page.goto('/');

    // Wait for modules to load in sidebar
    await expect(page.locator('[data-testid="module-sidebar"]')).toBeVisible();

    // Wait for categories to be rendered
    await expect(
      page.locator('[data-testid^="category-group-"]').first(),
    ).toBeVisible();

    // Find first visible module link within a category
    const firstModuleLink = page
      .locator('[data-testid^="category-modules-"] [data-testid="module-link"]')
      .first();
    await expect(firstModuleLink).toBeVisible();

    // Click and wait for navigation
    await Promise.all([
      page.waitForURL(/\/module\/[^\/]+\/[^\/]+/),
      firstModuleLink.click(),
    ]);

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
    await page.goto('/module/geoBlock');

    // Wait for page to load
    await expect(page.locator('[data-testid="module-details"]')).toBeVisible();

    // Look for Pretty/Raw toggle buttons
    const prettyButton = page.locator('button:has-text("Pretty")');
    const rawButton = page.locator('button:has-text("Raw")');

    if (await prettyButton.isVisible()) {
      // Test switching to Raw view
      await rawButton.click();
      // Check that at least one pre element is visible (multiple schema sections may have pre elements)
      await expect(page.locator('pre').first()).toBeVisible();

      // Switch back to Pretty view
      await prettyButton.click();
      await expect(
        page.locator('[data-testid="schema-renderer"]'),
      ).toBeVisible();
    }
  });

  test('collapsible code sections work', async ({ page }) => {
    // Navigate to a module page
    await page.goto('/module/geoBlock');

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
    await page.goto('/module/geoBlock');

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
    await page.goto('/module/geoBlock');

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

  test('category cards display on homepage', async ({ page }) => {
    await page.goto('/');

    // Check specific category cards exist
    const antiCheatCard = page.locator(
      '[data-testid="category-card-anti-cheat"]',
    );
    const communityMgmtCard = page.locator(
      '[data-testid="category-card-community-management"]',
    );
    const minigamesCard = page.locator(
      '[data-testid="category-card-minigames"]',
    );

    // Verify expected categories are visible
    await expect(antiCheatCard).toBeVisible();
    await expect(communityMgmtCard).toBeVisible();
    await expect(minigamesCard).toBeVisible();

    // Check that cards contain expected text
    await expect(antiCheatCard).toContainText('Anti Cheat');
    await expect(communityMgmtCard).toContainText('Community Management');
    await expect(minigamesCard).toContainText('Minigames');

    // Check that cards show module counts
    const antiCheatCount = await antiCheatCard
      .locator('.text-2xl')
      .textContent();
    expect(Number(antiCheatCount)).toBeGreaterThan(0);
  });

  test('sidebar shows modules grouped by category', async ({ page }) => {
    await page.goto('/');

    // Wait for sidebar to load
    await expect(page.locator('[data-testid="module-sidebar"]')).toBeVisible();

    // Check for category groups
    const categoryGroups = page.locator('[data-testid^="category-group-"]');
    const groupCount = await categoryGroups.count();
    expect(groupCount).toBeGreaterThan(0);

    // Check first category is expanded by default and shows modules
    const firstCategoryModules = page
      .locator('[data-testid^="category-modules-"]')
      .first();
    await expect(firstCategoryModules).toBeVisible();

    // Check that modules are visible within the category
    const modulesInFirstCategory = firstCategoryModules.locator(
      '[data-testid="module-link"]',
    );
    const moduleCount = await modulesInFirstCategory.count();
    expect(moduleCount).toBeGreaterThan(0);
  });

  test('category collapse/expand functionality works', async ({ page }) => {
    await page.goto('/');

    // Wait for sidebar to load
    await expect(page.locator('[data-testid="module-sidebar"]')).toBeVisible();

    // Find first category toggle button
    const firstCategoryToggle = page
      .locator('[data-testid^="category-toggle-"]')
      .first();
    await expect(firstCategoryToggle).toBeVisible();

    // Get the category name from the toggle button
    const categoryName = await firstCategoryToggle.getAttribute('data-testid');
    const category = categoryName?.replace('category-toggle-', '') || '';

    // Check initial state - modules should be visible
    const categoryModules = page.locator(
      `[data-testid="category-modules-${category}"]`,
    );
    await expect(categoryModules).toBeVisible();

    // Click to collapse
    await firstCategoryToggle.click();

    // Modules should now be hidden
    await expect(categoryModules).not.toBeVisible();

    // Click to expand again
    await firstCategoryToggle.click();

    // Modules should be visible again
    await expect(categoryModules).toBeVisible();
  });
});
