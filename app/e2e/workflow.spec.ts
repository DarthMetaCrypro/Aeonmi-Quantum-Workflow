/**
 * E2E Tests - App Features
 * Tests core app functionality (navigation, UI, basic interactions)
 * Note: Full workflow tests require authentication - tested separately
 */

import { test, expect } from '@playwright/test';

test.describe('App Navigation', () => {
  test('should load app without errors', async ({ page }) => {
    await page.goto('/');

    // Check page loaded
    await expect(page.getByText('QuantumForge')).toBeVisible();
  });

  test('should display quantum branding', async ({ page }) => {
    await page.goto('/');

    // Look for quantum-themed elements
    const pageContent = await page.content();
    expect(pageContent).toContain('QuantumForge');
  });

  test('should have responsive layout', async ({ page }) => {
    await page.goto('/');

    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.getByText('QuantumForge')).toBeVisible();

    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.getByText('QuantumForge')).toBeVisible();

    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.getByText('QuantumForge')).toBeVisible();
  });
});

test.describe('Security Features', () => {
  test('should not expose sensitive data in DOM', async ({ page }) => {
    await page.goto('/');

    const pageContent = await page.content();

    // Should not contain exposed tokens or secrets
    expect(pageContent).not.toContain('sk_test_');
    expect(pageContent).not.toContain('Bearer ey');
  });

  test('should have secure password inputs', async ({ page }) => {
    await page.goto('/');

    // Password field should be type="password"
    const passwordInput = page.getByLabel('Password');
    const inputType = await passwordInput.getAttribute('type');
    expect(inputType).toBe('password');
  });

  test('should use HTTPS in production', async ({ page }) => {
    // This test only makes sense in production
    if (process.env.NODE_ENV === 'production') {
      await page.goto('/');
      const url = page.url();
      expect(url).toMatch(/^https:/);
    } else {
      // Skip in development
      expect(true).toBe(true);
    }
  });
});

test.describe('Performance', () => {
  test('should load page within acceptable time', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    await expect(page.getByText('QuantumForge')).toBeVisible();
    const loadTime = Date.now() - startTime;

    // Should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });

  test('should not have console errors on load', async ({ page }) => {
    const consoleErrors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/');
    await expect(page.getByText('QuantumForge')).toBeVisible();

    // Filter out known acceptable errors (e.g., 404 for favicon)
    const criticalErrors = consoleErrors.filter(
      (error) => !error.includes('favicon') && !error.includes('404'),
    );

    expect(criticalErrors.length).toBe(0);
  });
});
