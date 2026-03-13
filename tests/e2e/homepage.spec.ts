import { test, expect } from '../support/merged-fixtures';

test.describe('Homepage', () => {
  test('[P0] loads with workflow-first navigation visible', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByText('Opportunity Research')).toBeVisible();
    await expect(page.getByRole('link', { name: /Home/ })).toBeVisible();
    await expect(page.getByRole('link', { name: /Signals/ })).toBeVisible();
    await expect(page.getByRole('link', { name: /Research/ })).toBeVisible();
    await expect(page.getByRole('link', { name: /Write/ })).toBeVisible();
    await expect(page.getByRole('link', { name: /Vault/ })).toBeVisible();
  });

  test('[P0] displays workflow quick actions', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByText('Quick Actions')).toBeVisible();
    await expect(page.getByText('Refresh Signals')).toBeVisible();
    await expect(page.getByText('Start Research')).toBeVisible();
    await expect(page.getByText('Draft Artifact')).toBeVisible();
  });

  test('[P1] shows today\'s signal brief on the homepage', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByText(/Today[’']s Signal Brief/)).toBeVisible();
  });

  test('[P1] routes to signals surface via query parameter', async ({ page }) => {
    await page.goto('/?tool=signal');

    await expect(page.getByRole('heading', { name: 'Signals' })).toBeVisible();
  });

  test('[P1] routes to research task via query parameter', async ({ page }) => {
    await page.goto('/?tool=play-store');

    await expect(page.getByText('Research Task')).toBeVisible();
    await expect(page.getByText('Play Store Market Engine')).toBeVisible();
  });
});
