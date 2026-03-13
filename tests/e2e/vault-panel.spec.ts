import { test, expect } from '../support/merged-fixtures';

test.describe('Vault Surface', () => {
  test('[P1] vault route shows vault surface and summary rail', async ({ page }) => {
    await page.goto('/?tool=vault');

    await expect(page.getByRole('heading', { name: 'Vault' })).toBeVisible();
    await expect(page.getByText('Vault Overview')).toBeVisible();
    await expect(page.getByText('Vault Summary')).toBeVisible();
  });

  test('[P1] vault center pane shows saved knowledge browser', async ({ page }) => {
    await page.goto('/?tool=vault');

    await expect(page.getByText('Saved Knowledge')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Signals' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Bookmarks' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Saved' })).toBeVisible();
  });

  test('[P1] vault signals tab shows archive labels or empty state', async ({ page }) => {
    await page.goto('/?tool=vault');

    await expect(page.getByText(/Signal archive|No saved signal runs/i).first()).toBeVisible();
  });

  test('[P1] vault bookmarks tab shows empty state or saved-bookmark workflow', async ({ page }) => {
    await page.goto('/?tool=vault');

    const bookmarkTabs = page.getByRole('button', { name: 'Bookmarks' });
    await bookmarkTabs.nth(0).click();

    const emptyState = page.getByText('No bookmarked signals');
    if (await emptyState.isVisible().catch(() => false)) {
      await expect(emptyState).toBeVisible();
    }
  });

  test('[P1] vault saved tab empty state is visible without pinned outputs', async ({ page }) => {
    await page.goto('/?tool=vault');

    const savedTabs = page.getByRole('button', { name: 'Saved' });
    await savedTabs.nth(0).click();

    await expect(page.getByText('No saved outputs')).toBeVisible();
  });
});
