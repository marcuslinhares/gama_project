import { test, expect } from '@playwright/test';

test.describe('Dark Mode', () => {
  test('starts light by default', async ({ page }) => {
    await page.addInitScript(() => localStorage.removeItem('theme'));
    await page.goto('/');
    const htmlClass = await page.locator('html').getAttribute('class');
    expect(htmlClass ?? '').not.toContain('dark');
  });

  test('toggle switches to dark mode and persists on reload', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('theme', 'dark'));
    await page.goto('/');
    await expect(page.locator('html')).toHaveClass(/dark/);
    await page.reload();
    await expect(page.locator('html')).toHaveClass(/dark/);
    const theme = await page.evaluate(() => localStorage.getItem('theme'));
    expect(theme).toBe('dark');
  });
});
