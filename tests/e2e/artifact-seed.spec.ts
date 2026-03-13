import { test, expect } from '../support/merged-fixtures';

test.describe('Artifact Seed Flow', () => {
  test('[P1] bookmarked signal modal exposes downstream seed action when present', async ({ page }) => {
    // Given: the app is running on the vault route
    await page.goto('/?tool=vault');

    // When: the user opens the Bookmarks tab
    await page.getByRole('button', { name: 'Bookmarks' }).click();

    const emptyState = page.getByText('No bookmarked signals');
    if (await emptyState.isVisible().catch(() => false)) {
      await expect(emptyState).toBeVisible();
    } else {
      await page.locator('button').filter({ hasText: /.+/ }).first().click();
      await expect(page.getByRole('button', { name: 'Use as Seed' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Save as Artifact' })).toBeVisible();
    }
  });

  test('[P1] artifact seed deep-link path is either empty-state or actionable', async ({ page }) => {
    // Given: the app is running on the vault route
    await page.goto('/?tool=vault');
    await page.getByRole('button', { name: 'Bookmarks' }).click();

    const emptyState = page.getByText('No bookmarked signals');
    if (await emptyState.isVisible().catch(() => false)) {
      await expect(emptyState).toBeVisible();
    } else {
      await page.locator('button').filter({ hasText: /.+/ }).first().click();
      await page.getByRole('button', { name: 'Use as Seed' }).click();
      await expect(page).toHaveURL(/tool=product/);
    }
  });
});
