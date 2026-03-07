import { test, expect } from '../support/merged-fixtures';

test.describe('Homepage', () => {
  test('[P0] loads with sidebar navigation visible', async ({ page }) => {
    // Given: the app is running
    // When: a user navigates to the homepage
    await page.goto('/');

    // Then: the sidebar with KWC OS branding is visible
    await expect(page.getByText('KWC OS')).toBeVisible();
  });

  test('[P0] displays skill quick launch grid', async ({ page }) => {
    // Given: the app is running
    // When: a user navigates to the homepage
    await page.goto('/');

    // Then: the Quick Launch section with skill buttons is visible
    await expect(page.getByText('Quick Launch')).toBeVisible();
    await expect(page.getByText('Signal Engine').first()).toBeVisible();
  });

  test('[P1] routes to signal tool via query parameter', async ({ page }) => {
    // Given: a tool query parameter is provided
    // When: a user navigates with ?tool=signal
    await page.goto('/?tool=signal');

    // Then: the Signal Engine workspace should be shown
    await expect(page.getByText('Signal Engine')).toBeVisible();
  });

  test('[P1] routes to play-store tool via query parameter', async ({ page }) => {
    // Given: a tool query parameter for play-store
    // When: a user navigates with ?tool=play-store
    await page.goto('/?tool=play-store');

    // Then: the Play Store workspace should be shown
    await expect(page.getByText('Play Store Market Engine')).toBeVisible();
  });
});
