import { test, expect } from '../support/merged-fixtures';

test.describe('Automation Panel', () => {
  test('[P1] workspace automation tab shows canonical signal schedule', async ({ page }) => {
    // Given: the app is running on the dashboard
    await page.goto('/');

    // When: the user dismisses onboarding if present and opens the Automation tab in the right workspace rail
    const skipTour = page.getByRole('button', { name: 'Skip tour' });
    if (await skipTour.isVisible().catch(() => false)) {
      await skipTour.click();
    }
    await page.getByRole('button', { name: 'Automation' }).click();
    await page.getByRole('heading', { name: 'Daily Signal refresh' }).nth(1).waitFor({ state: 'visible' });

    // Then: the canonical schedule, log path, and health surface are visible
    await expect(page.getByRole('heading', { name: 'Daily Signal refresh' }).nth(1)).toBeVisible();
    await expect(page.getByText('backend/signal_engine.py', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('logs/digest_cron.log', { exact: true }).nth(1)).toBeVisible();
    await expect(page.getByText(/Recommended cron entry/i).first()).toBeVisible();
  });
});
