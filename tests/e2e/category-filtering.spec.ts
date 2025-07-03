import { test, expect } from '@playwright/test';

test.describe('Category Filtering', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to homepage
    await page.goto('/');

    // Wait for modules to load
    await expect(page.locator('[data-testid="module-sidebar"]')).toBeVisible();
    await expect(
      page.locator('[data-testid^="category-group-"]').first(),
    ).toBeVisible();
  });

  test('category filter buttons are visible and functional', async ({
    page,
  }) => {
    // Check that category filter section exists
    const categoryFilterSection = page.locator(
      '[data-testid="category-filter-buttons"]',
    );
    await expect(categoryFilterSection).toBeVisible();

    // Check that All button exists and is active by default
    const allButton = page.locator('[data-testid="category-filter-all"]');
    await expect(allButton).toBeVisible();
    await expect(allButton).toHaveClass(/btn-takaro-primary/);

    // Check specific category buttons exist
    const antiCheatButton = page.locator(
      '[data-testid="category-filter-anti-cheat"]',
    );
    const communityMgmtButton = page.locator(
      '[data-testid="category-filter-community-management"]',
    );
    const minigamesButton = page.locator(
      '[data-testid="category-filter-minigames"]',
    );

    await expect(antiCheatButton).toBeVisible();
    await expect(communityMgmtButton).toBeVisible();
    await expect(minigamesButton).toBeVisible();

    // Verify they're not active initially
    await expect(antiCheatButton).not.toHaveClass(/btn-takaro-primary/);
    await expect(communityMgmtButton).not.toHaveClass(/btn-takaro-primary/);
    await expect(minigamesButton).not.toHaveClass(/btn-takaro-primary/);
  });

  test('category filter shows only modules from selected category', async ({
    page,
  }) => {
    // Click Anti-cheat category filter
    const antiCheatButton = page.locator(
      '[data-testid="category-filter-anti-cheat"]',
    );
    await antiCheatButton.click();

    // Wait for filter to apply
    await expect(antiCheatButton).toHaveClass(/btn-takaro-primary/);

    // Check that only anti-cheat category group is visible
    const categoryGroups = page.locator('[data-testid^="category-group-"]');
    const visibleGroups = await categoryGroups.count();

    // Should only show one category group
    expect(visibleGroups).toBe(1);

    // Verify it's the anti-cheat group
    const antiCheatGroup = page.locator(
      '[data-testid="category-group-anti-cheat"]',
    );
    await expect(antiCheatGroup).toBeVisible();

    // Verify modules in this category are visible
    const antiCheatModules = antiCheatGroup.locator(
      '[data-testid="module-link"]',
    );
    const moduleCount = await antiCheatModules.count();
    expect(moduleCount).toBeGreaterThan(0);
  });

  test('category filter switches correctly between options', async ({
    page,
  }) => {
    const allButton = page.locator('[data-testid="category-filter-all"]');
    const antiCheatButton = page.locator(
      '[data-testid="category-filter-anti-cheat"]',
    );
    const minigamesButton = page.locator(
      '[data-testid="category-filter-minigames"]',
    );

    // Start with All (default)
    await expect(allButton).toHaveClass(/btn-takaro-primary/);

    // Switch to Anti-cheat
    await antiCheatButton.click();
    await expect(antiCheatButton).toHaveClass(/btn-takaro-primary/);
    await expect(allButton).not.toHaveClass(/btn-takaro-primary/);
    await expect(minigamesButton).not.toHaveClass(/btn-takaro-primary/);

    // Switch to Minigames
    await minigamesButton.click();
    await expect(minigamesButton).toHaveClass(/btn-takaro-primary/);
    await expect(antiCheatButton).not.toHaveClass(/btn-takaro-primary/);
    await expect(allButton).not.toHaveClass(/btn-takaro-primary/);

    // Switch back to All
    await allButton.click();
    await expect(allButton).toHaveClass(/btn-takaro-primary/);
    await expect(antiCheatButton).not.toHaveClass(/btn-takaro-primary/);
    await expect(minigamesButton).not.toHaveClass(/btn-takaro-primary/);
  });

  test('category filter works with search', async ({ page }) => {
    // Apply minigames category filter
    const minigamesButton = page.locator(
      '[data-testid="category-filter-minigames"]',
    );
    await minigamesButton.click();

    // Search for a term
    const searchInput = page.locator('[data-testid="search-input"]');
    await searchInput.fill('black');

    // Should show filtered results within the category
    const resultsCount = page.locator('[data-testid="search-results-count"]');
    await expect(resultsCount).toBeVisible();

    // Check that blackjack module is visible (it's in minigames)
    const blackjackModule = page
      .locator('[data-testid="module-link"]')
      .filter({ hasText: 'BlackJack' });
    await expect(blackjackModule).toBeVisible();
  });

  test('clear button resets category filter', async ({ page }) => {
    // Apply category filter
    const antiCheatButton = page.locator(
      '[data-testid="category-filter-anti-cheat"]',
    );
    await antiCheatButton.click();
    await expect(antiCheatButton).toHaveClass(/btn-takaro-primary/);

    // Also add a search term
    const searchInput = page.locator('[data-testid="search-input"]');
    await searchInput.fill('test');

    // Click Clear button - should be in the search results count area
    const clearButton = page.locator(
      '[data-testid="search-results-count"] button:has-text("Clear")',
    );
    await expect(clearButton).toBeVisible();
    await clearButton.click();

    // Category filter should reset to All
    const allButton = page.locator('[data-testid="category-filter-all"]');
    await expect(allButton).toHaveClass(/btn-takaro-primary/);
    await expect(antiCheatButton).not.toHaveClass(/btn-takaro-primary/);

    // Search should be empty - wait for it to clear
    await page.waitForFunction(
      () => {
        const input = document.querySelector(
          '[data-testid="search-input"]',
        ) as HTMLInputElement;
        return input && input.value === '';
      },
      { timeout: 5000 },
    );

    await expect(searchInput).toHaveValue('');
  });

  test('category filter persists in localStorage', async ({
    page,
    context,
  }) => {
    // Set filter to Minigames
    const minigamesButton = page.locator(
      '[data-testid="category-filter-minigames"]',
    );
    await minigamesButton.click();
    await expect(minigamesButton).toHaveClass(/btn-takaro-primary/);

    // Check localStorage
    const filterValue = await page.evaluate(() => {
      return localStorage.getItem('module-category-filter');
    });
    expect(filterValue).toBe('minigames');

    // Open new page in same context
    const newPage = await context.newPage();
    await newPage.goto('/');

    // Wait for sidebar to load
    await expect(
      newPage.locator('[data-testid="module-sidebar"]'),
    ).toBeVisible();

    // Filter should still be Minigames
    const newMinigamesButton = newPage.locator(
      '[data-testid="category-filter-minigames"]',
    );
    await expect(newMinigamesButton).toHaveClass(/btn-takaro-primary/);

    await newPage.close();
  });

  test('collapsed category state persists', async ({ page }) => {
    // Find and collapse the first category
    const firstCategoryToggle = page
      .locator('[data-testid^="category-toggle-"]')
      .first();
    const categoryName = await firstCategoryToggle.getAttribute('data-testid');
    const category = categoryName?.replace('category-toggle-', '') || '';

    // Click to collapse
    await firstCategoryToggle.click();

    // Verify it's collapsed
    const categoryModules = page.locator(
      `[data-testid="category-modules-${category}"]`,
    );
    await expect(categoryModules).not.toBeVisible();

    // Reload the page
    await page.reload();

    // Wait for sidebar to load
    await expect(page.locator('[data-testid="module-sidebar"]')).toBeVisible();

    // Category should still be collapsed
    const reloadedCategoryModules = page.locator(
      `[data-testid="category-modules-${category}"]`,
    );
    await expect(reloadedCategoryModules).not.toBeVisible();
  });

  test('category counts are accurate', async ({ page }) => {
    // Get all category filter buttons with counts
    const categoryButtons = page.locator(
      'button[data-testid^="category-filter-"]:not([data-testid="category-filter-all"])',
    );
    const buttonCount = await categoryButtons.count();

    for (let i = 0; i < buttonCount; i++) {
      const button = categoryButtons.nth(i);
      const buttonText = await button.textContent();
      const countMatch = buttonText?.match(/\((\d+)\)/);

      if (countMatch) {
        const expectedCount = parseInt(countMatch[1]);

        // Click the button
        await button.click();
        await expect(button).toHaveClass(/btn-takaro-primary/);

        // Count visible modules
        const visibleModules = page.locator(
          '[data-testid="module-link"]:visible',
        );
        const actualCount = await visibleModules.count();

        expect(actualCount).toBe(expectedCount);

        // Reset to All for next iteration
        const allButton = page.locator('[data-testid="category-filter-all"]');
        await allButton.click();
      }
    }
  });

  test('empty category filter shows appropriate message', async ({ page }) => {
    // Search for something that won't match any category
    const searchInput = page.locator('[data-testid="search-input"]');
    await searchInput.fill('xyznonexistentcategoryxyz');

    // Then apply a category filter
    const minigamesButton = page.locator(
      '[data-testid="category-filter-minigames"]',
    );
    await minigamesButton.click();

    // Should show no results message
    await expect(
      page.locator('text=No modules match your filters'),
    ).toBeVisible();

    // Clear button should be visible
    const clearButton = page.locator('button:has-text("Clear")').first();
    await expect(clearButton).toBeVisible();
  });
});
