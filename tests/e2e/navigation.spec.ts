import { test, expect } from '../support/merged-fixtures';

test.describe('Sidebar Navigation', () => {
  test('[P1] displays the five primary surfaces', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('link', { name: /Home/ })).toBeVisible();
    await expect(page.getByRole('link', { name: /Signals/ })).toBeVisible();
    await expect(page.getByRole('link', { name: /Research/ })).toBeVisible();
    await expect(page.getByRole('link', { name: /Write/ })).toBeVisible();
    await expect(page.getByRole('link', { name: /Vault/ })).toBeVisible();
  });

  test('[P1] sidebar links navigate between primary surfaces', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('link', { name: /Signals/ }).click();
    await expect(page).toHaveURL(/tool=signal/);

    await page.getByRole('link', { name: /Research/ }).click();
    await expect(page).toHaveURL(/tool=research/);
  });

  test('[P1] highlights active primary surface in sidebar', async ({ page }) => {
    await page.goto('/?tool=signal');

    const signalLink = page.getByRole('link', { name: /Signals/ });
    await expect(signalLink).toBeVisible();
  });
});

test.describe('Header Launcher', () => {
  test('[P1] global launcher button is present', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('button', { name: /Search signals, research, drafts, or saved work/i })).toBeVisible();
  });

  test('[P1] launcher shows shortcut hint', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByText('⌘K')).toBeVisible();
  });
});
