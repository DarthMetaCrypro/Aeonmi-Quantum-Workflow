/**
 * E2E Tests - Authentication Flow
 * Tests login, registration, and protected routes
 */

import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display login screen with all elements', async ({ page }) => {
    // Check for QuantumForge branding
    await expect(page.getByText('QuantumForge')).toBeVisible();
    await expect(page.getByText('Sign in to continue')).toBeVisible();

    // Check for form inputs
    await expect(page.getByLabel('Email address')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();

    // Check for buttons
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /create account/i })).toBeVisible();
  });

  test('should show validation error for invalid email', async ({ page }) => {
    const emailInput = page.getByLabel('Email address');
    const passwordInput = page.getByLabel('Password');
    const signInButton = page.getByRole('button', { name: /sign in/i });

    // Fill with invalid email
    await emailInput.fill('not-an-email');
    await passwordInput.fill('TestPass123');
    await signInButton.click();

    // Should stay on login page (validation failed)
    await expect(page.getByText('Sign in to continue')).toBeVisible();
  });

  test('should show validation error for short password', async ({ page }) => {
    const emailInput = page.getByLabel('Email address');
    const passwordInput = page.getByLabel('Password');
    const signInButton = page.getByRole('button', { name: /sign in/i });

    // Fill with weak password
    await emailInput.fill('test@example.com');
    await passwordInput.fill('123');
    await signInButton.click();

    // Should stay on login page
    await expect(page.getByText('Sign in to continue')).toBeVisible();
  });

  test('should navigate to registration screen', async ({ page }) => {
    // Click "Create Account" button
    await page.getByRole('button', { name: /create account/i }).click();

    // Should show registration form
    await expect(page.getByText('Join QuantumForge today')).toBeVisible();
    await expect(page.getByLabel('Full name')).toBeVisible();
    await expect(page.getByLabel('Email address')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByLabel('Confirm password')).toBeVisible();

    // Check for password requirements
    await expect(page.getByText('Minimum 8 characters')).toBeVisible();
    await expect(page.getByText('At least 1 uppercase letter')).toBeVisible();
    await expect(page.getByText('At least 1 number')).toBeVisible();
  });

  test('should navigate back to login from registration', async ({ page }) => {
    // Go to registration
    await page.getByRole('button', { name: /create account/i }).click();
    await expect(page.getByText('Join QuantumForge today')).toBeVisible();

    // Go back to login
    await page.getByText('Sign In').click();
    await expect(page.getByText('Sign in to continue')).toBeVisible();
  });

  test('should show validation error for mismatched passwords on registration', async ({
    page,
  }) => {
    // Go to registration
    await page.getByRole('button', { name: /create account/i }).click();

    const nameInput = page.getByLabel('Full name');
    const emailInput = page.getByLabel('Email address');
    const passwordInput = page.getByLabel('Password');
    const confirmInput = page.getByLabel('Confirm password');
    const createButton = page.getByRole('button', { name: /create account/i });

    // Fill with mismatched passwords
    await nameInput.fill('John Doe');
    await emailInput.fill('john@example.com');
    await passwordInput.fill('Password123');
    await confirmInput.fill('Different456');
    await createButton.click();

    // Should stay on registration page
    await expect(page.getByText('Join QuantumForge today')).toBeVisible();
  });

  test('should show validation error for empty name on registration', async ({
    page,
  }) => {
    // Go to registration
    await page.getByRole('button', { name: /create account/i }).click();

    const emailInput = page.getByLabel('Email address');
    const passwordInput = page.getByLabel('Password');
    const confirmInput = page.getByLabel('Confirm password');
    const createButton = page.getByRole('button', { name: /create account/i });

    // Fill without name
    await emailInput.fill('john@example.com');
    await passwordInput.fill('Password123');
    await confirmInput.fill('Password123');
    await createButton.click();

    // Should stay on registration page
    await expect(page.getByText('Join QuantumForge today')).toBeVisible();
  });

  test('should have accessible form labels', async ({ page }) => {
    // Check login form accessibility
    const emailInput = page.getByLabel('Email address');
    const passwordInput = page.getByLabel('Password');

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();

    // Check buttons have accessible names
    const signInButton = page.getByRole('button', { name: /sign in/i });
    await expect(signInButton).toBeVisible();
  });
});
