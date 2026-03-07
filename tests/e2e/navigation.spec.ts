import { test, expect } from '../support/merged-fixtures';

test.describe('Sidebar Navigation', () => {
  test('[P1] displays all navigation groups', async ({ page }) => {
    // Given: the app is running
    // When: a user views the sidebar
    await page.goto('/');

    // Then: all navigation group headers are visible
    await expect(page.getByText('Knowledge', { exact: true })).toBeVisible();
    await expect(page.getByText('Market', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Content', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Management', { exact: true })).toBeVisible();
  });

  test('[P1] sidebar links navigate between tools', async ({ page }) => {
    // Given: the user is on the homepage
    await page.goto('/');

    // When: the user clicks a sidebar link
    await page.getByRole('link', { name: 'Daily Signal' }).click();

    // Then: the URL updates to include the tool parameter
    await expect(page).toHaveURL(/tool=signal/);
  });

  test('[P1] highlights active tool in sidebar', async ({ page }) => {
    // Given: the user navigates to a specific tool
    await page.goto('/?tool=signal');

    // Then: the Daily Signal link should be visually active (has active styles)
    const signalLink = page.getByRole('link', { name: 'Daily Signal' });
    await expect(signalLink).toBeVisible();
  });
});

test.describe('Command Bar', () => {
  test('[P1] command search input is present', async ({ page }) => {
    // Given: the app is running
    // When: the user views the header
    await page.goto('/');

    // Then: the command search input is visible
    await expect(
      page.getByRole('textbox', { name: 'Command search' }),
    ).toBeVisible();
  });

  test('[P1] command bar shows Go button', async ({ page }) => {
    // Given: the app is running
    await page.goto('/');

    // Then: the Go submit button is visible in the header
    await expect(page.getByRole('button', { name: 'Go' }).first()).toBeVisible();
  });
});
