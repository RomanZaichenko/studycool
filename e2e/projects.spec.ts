import { test, expect } from '@playwright/test';

test.describe('Projects E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/');
  });

  test('should completely create a new project and display it', async ({ page }) => {
    await expect(page.getByText('Projects', { exact: true })).toBeVisible();

    await page.getByRole('button', { name: 'Create new project' }).click();

    const modalHeading = page.getByText('Create project');
    await expect(modalHeading).toBeVisible();

    const projectName = 'Example project name';
    await page.getByPlaceholder('Name', { exact: true }).fill(projectName);
    await page.getByPlaceholder('Description').fill('Description!');

    await page.getByRole('button', { name: 'Create', exact: true}).click();

    await expect(modalHeading).toBeHidden();

    const newProjectCard = page.getByText(projectName);
    await expect(newProjectCard).toBeVisible();
  });
});