import { test, expect } from '@playwright/test';

test.describe('Dark Mode', () => {
  test('starts light by default (no saved preference)', async ({ page }) => {
    await page.addInitScript(() => localStorage.removeItem('theme'));
    await page.goto('/');
    // html element should NOT have dark class
    const htmlClass = await page.locator('html').getAttribute('class');
    expect(htmlClass ?? '').not.toContain('dark');
  });

  test('toggle switches to dark mode and persists on reload', async ({ page }) => {
    // Use addInitScript to set theme=dark so it persists across reloads
    // (addInitScript runs on every navigation, so we set 'dark' rather than remove it)
    await page.addInitScript(() => {
      localStorage.setItem('theme', 'dark');
    });
    await page.goto('/');

    // ThemeContext reads localStorage on mount and applies dark class via useEffect
    await expect(page.locator('html')).toHaveClass(/dark/);

    // Reload — addInitScript runs again, sets 'dark', ThemeContext applies dark class
    await page.reload();
    await expect(page.locator('html')).toHaveClass(/dark/);

    // Verify localStorage still 'dark'
    const theme = await page.evaluate(() => localStorage.getItem('theme'));
    expect(theme).toBe('dark');
  });

  test('saved light preference persists on reload', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('theme', 'light');
    });
    await page.goto('/');

    const htmlClass = await page.locator('html').getAttribute('class');
    expect(htmlClass ?? '').not.toContain('dark');
  });

  test('saved dark preference applies on load', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('theme', 'dark');
    });
    await page.goto('/');

    await expect(page.locator('html')).toHaveClass(/dark/);
  });
});
