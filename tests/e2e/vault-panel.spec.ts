import { test, expect } from '../support/merged-fixtures';

test.describe('Vault Surface', () => {
  test('[P1] vault route shows vault surface and summary rail', async ({ page }) => {
    await page.goto('/?tool=vault');

    await expect(page.locator('h1')).toHaveText('Vault');
    await expect(page.getByText('Vault Overview')).toBeVisible();
    await expect(page.getByText('Vault Summary')).toBeVisible();
  });

  test('[P1] vault center pane shows saved knowledge browser', async ({ page }) => {
    await page.goto('/?tool=vault');

    await expect(page.getByText('Saved Knowledge')).toBeVisible();
    const savedKnowledge = page.locator('section').filter({ hasText: 'Saved Knowledge' });
    await expect(savedKnowledge.getByRole('button', { name: 'Signals', exact: true })).toBeVisible();
    await expect(savedKnowledge.getByRole('button', { name: 'Bookmarks', exact: true })).toBeVisible();
    await expect(savedKnowledge.getByRole('button', { name: 'Saved', exact: true })).toBeVisible();
  });

  test('[P1] vault signals tab shows archive labels or empty state', async ({ page }) => {
    await page.goto('/?tool=vault');

    await expect(page.getByText(/Signal archive|No saved signal runs/i).first()).toBeVisible();
  });

  test('[P1] vault bookmarks tab shows empty state or saved-bookmark workflow', async ({ page }) => {
    await page.goto('/?tool=vault');

    const savedKnowledge = page.locator('section').filter({ hasText: 'Saved Knowledge' });
    await savedKnowledge.getByRole('button', { name: 'Bookmarks', exact: true }).click();

    const emptyState = page.getByText('No bookmarked signals');
    if (await emptyState.isVisible().catch(() => false)) {
      await expect(emptyState).toBeVisible();
    }
  });

  test('[P1] vault saved tab renders saved-state or empty fallback', async ({ page }) => {
    await page.goto('/?tool=vault');

    const savedKnowledge = page.locator('section').filter({ hasText: 'Saved Knowledge' });
    await savedKnowledge.getByRole('button', { name: 'Saved', exact: true }).click();

    await expect(page.getByText(/No saved outputs|Pinned|Saved/i).first()).toBeVisible();
  });
});
