import { test, expect } from '@playwright/test';

test.describe('Create map card', () => {
  test('should create a map and automatically navigate to its canvas', async ({ page }) => {
    await page.goto('http://localhost:3000/');

    await expect(page.getByText('Recent Maps', { exact: true })).toBeVisible();

    await page.getByRole('button', { name: 'Create new map' }).click();

    const modalHeading = page.getByText('Create map', { exact: true });
    await expect(modalHeading).toBeVisible();

    const mapTitle = 'My UX Perfect Map';
    await page.getByPlaceholder('Name', { exact: true }).fill(mapTitle);
    await page.getByPlaceholder('Description').fill('Auto-redirect FTW');
    
    await page.getByRole('button', { name: 'Create', exact: true }).click();

    await expect(page).toHaveURL(/.*\/map-area\/\d+/);
    const flowCanvas = page.locator('.react-flow');
    await expect(flowCanvas).toBeVisible();
  });
});