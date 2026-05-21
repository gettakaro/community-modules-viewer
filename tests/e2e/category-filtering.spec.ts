import { test, expect } from '@playwright/test';

test.describe('Category Filtering', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    await expect(page.locator('[data-testid="module-sidebar"]')).toBeVisible();
    await expect(
      page.locator('[data-testid^="category-group-"]').first(),
    ).toBeVisible();
    await page.waitForFunction(
      () => localStorage.getItem('module-category-filter') === 'all',
    );
    await expect(
      page.locator('[data-testid="category-filter-select"]'),
    ).toBeEnabled();
  });

  test('category filter select is visible and functional', async ({ page }) => {
    const categoryFilterSection = page.locator(
      '[data-testid="category-filter-buttons"]',
    );
    await expect(categoryFilterSection).toBeVisible();

    const categorySelect = page.locator(
      '[data-testid="category-filter-select"]',
    );
    await expect(categorySelect).toBeVisible();
    await expect(categorySelect).toHaveValue('all');

    await expect(
      categorySelect.locator('option[value="anti-cheat"]'),
    ).toHaveCount(1);
    await expect(
      categorySelect.locator('option[value="community-management"]'),
    ).toHaveCount(1);
    await expect(
      categorySelect.locator('option[value="minigames"]'),
    ).toHaveCount(1);
  });

  test('category filter shows only modules from selected category', async ({
    page,
  }) => {
    const categorySelect = page.locator(
      '[data-testid="category-filter-select"]',
    );

    await categorySelect.selectOption('anti-cheat');
    await expect(categorySelect).toHaveValue('anti-cheat');

    const categoryGroups = page.locator('[data-testid^="category-group-"]');
    await expect(categoryGroups).toHaveCount(1);

    const antiCheatGroup = page.locator(
      '[data-testid="category-group-anti-cheat"]',
    );
    await expect(antiCheatGroup).toBeVisible();

    const antiCheatModules = antiCheatGroup.locator(
      '[data-testid="module-link"]',
    );
    expect(await antiCheatModules.count()).toBeGreaterThan(0);
  });

  test('category filter switches correctly between options', async ({
    page,
  }) => {
    const categorySelect = page.locator(
      '[data-testid="category-filter-select"]',
    );

    await expect(categorySelect).toHaveValue('all');

    await categorySelect.selectOption('anti-cheat');
    await expect(categorySelect).toHaveValue('anti-cheat');
    await expect(
      page.locator('[data-testid="category-group-anti-cheat"]'),
    ).toBeVisible();

    await categorySelect.selectOption('minigames');
    await expect(categorySelect).toHaveValue('minigames');
    await expect(
      page.locator('[data-testid="category-group-minigames"]'),
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="category-group-anti-cheat"]'),
    ).toHaveCount(0);

    await categorySelect.selectOption('all');
    await expect(categorySelect).toHaveValue('all');
    expect(
      await page.locator('[data-testid^="category-group-"]').count(),
    ).toBeGreaterThan(1);
  });

  test('category filter works with search', async ({ page }) => {
    const categorySelect = page.locator(
      '[data-testid="category-filter-select"]',
    );
    await categorySelect.selectOption('minigames');

    const searchInput = page.locator('[data-testid="search-input"]');
    await searchInput.fill('black');

    const resultsCount = page.locator('[data-testid="search-results-count"]');
    await expect(resultsCount).toContainText('Showing');

    const blackjackModule = page
      .locator('[data-testid="module-link"]')
      .filter({ hasText: 'BlackJack' });
    await expect(blackjackModule).toBeVisible();
  });

  test('clear button resets category filter', async ({ page }) => {
    const categorySelect = page.locator(
      '[data-testid="category-filter-select"]',
    );
    await categorySelect.selectOption('anti-cheat');
    await expect(categorySelect).toHaveValue('anti-cheat');

    const searchInput = page.locator('[data-testid="search-input"]');
    await searchInput.fill('test');

    const clearButton = page.locator('button:has-text("Clear filters")');
    await expect(clearButton).toBeVisible();
    await clearButton.click();

    await expect(categorySelect).toHaveValue('all');
    await expect(searchInput).toHaveValue('');
  });

  test('category filter persists in localStorage', async ({
    page,
    context,
  }) => {
    const categorySelect = page.locator(
      '[data-testid="category-filter-select"]',
    );

    await categorySelect.selectOption('minigames');
    await expect(categorySelect).toHaveValue('minigames');

    const filterValue = await page.evaluate(() => {
      return localStorage.getItem('module-category-filter');
    });
    expect(filterValue).toBe('minigames');

    const newPage = await context.newPage();
    await newPage.goto('/');

    await expect(
      newPage.locator('[data-testid="module-sidebar"]'),
    ).toBeVisible();

    await expect(
      newPage.locator('[data-testid="category-filter-select"]'),
    ).toHaveValue('minigames');

    await newPage.close();
  });

  test('collapsed category state persists', async ({ page }) => {
    await page.evaluate(() => localStorage.removeItem('collapsed-categories'));
    await page.reload();
    await expect(page.locator('[data-testid="module-sidebar"]')).toBeVisible();

    const firstCategoryToggle = page
      .locator('[data-testid^="category-toggle-"]')
      .first();
    const categoryName = await firstCategoryToggle.getAttribute('data-testid');
    const category = categoryName?.replace('category-toggle-', '') || '';

    const categoryModules = page.locator(
      `[data-testid="category-modules-${category}"]`,
    );
    await expect(categoryModules).toBeVisible();
    await expect(firstCategoryToggle).toHaveAttribute('aria-expanded', 'true');

    await firstCategoryToggle.click();

    await expect(firstCategoryToggle).toHaveAttribute('aria-expanded', 'false');
    await expect(categoryModules).not.toBeVisible();
    await expect
      .poll(() =>
        page.evaluate((collapsedCategory) => {
          const stored = localStorage.getItem('collapsed-categories');
          return stored
            ? JSON.parse(stored).includes(collapsedCategory)
            : false;
        }, category),
      )
      .toBe(true);

    await page.reload();

    await expect(page.locator('[data-testid="module-sidebar"]')).toBeVisible();

    const reloadedCategoryModules = page.locator(
      `[data-testid="category-modules-${category}"]`,
    );
    await expect(firstCategoryToggle).toHaveAttribute('aria-expanded', 'false');
    await expect(reloadedCategoryModules).not.toBeVisible();
  });

  test('category counts are accurate', async ({ page }) => {
    const categorySelect = page.locator(
      '[data-testid="category-filter-select"]',
    );
    const options = await categorySelect
      .locator('option')
      .evaluateAll((items) =>
        items
          .map((item) => ({
            value: (item as HTMLOptionElement).value,
            text: item.textContent || '',
          }))
          .filter((item) => item.value !== 'all'),
      );

    for (const option of options) {
      const countMatch = option.text.match(/\((\d+)\)/);
      if (!countMatch) continue;

      const expectedCount = parseInt(countMatch[1]);

      await categorySelect.selectOption(option.value);
      await expect(categorySelect).toHaveValue(option.value);

      const visibleModules = page.locator(
        '[data-testid="module-link"]:visible',
      );
      const actualCount = await visibleModules.count();

      expect(actualCount).toBe(expectedCount);

      await categorySelect.selectOption('all');
    }
  });

  test('empty category filter shows appropriate message', async ({ page }) => {
    const searchInput = page.locator('[data-testid="search-input"]');
    await searchInput.fill('xyznonexistentcategoryxyz');

    const categorySelect = page.locator(
      '[data-testid="category-filter-select"]',
    );
    await categorySelect.selectOption('minigames');

    await expect(
      page.locator('text=No modules match your filters'),
    ).toBeVisible();

    await expect(
      page.locator('button:has-text("Clear filters")'),
    ).toBeVisible();
  });
});
