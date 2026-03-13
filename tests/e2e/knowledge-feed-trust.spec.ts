import { test, expect } from '../support/merged-fixtures';

test.describe('Knowledge Feed Trust Cues', () => {
  test('[P1] homepage signal brief shows freshness or source context', async ({ page }) => {
    // Given: the app is running on the homepage
    await page.goto('/');

    // Then: the signal brief section remains visible
    await expect(page.getByText("Today’s Signal Brief")).toBeVisible();

    // And: at least one trust cue is shown for the snapshot
    const sourceCue = page.getByText(/Source:/);
    const freshnessCue = page.getByText(/min old|Persisted snapshot|In-memory latest run/i);
    await expect(sourceCue.or(freshnessCue).first()).toBeVisible();
  });
});
