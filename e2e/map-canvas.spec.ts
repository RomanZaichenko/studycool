import { test, expect } from '@playwright/test';

test.describe('Knowledge Map Canvas Interaction', () => {
  test('should create nodes, connect them, and auto-create a node on empty drop', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await page.getByRole('button', { name: 'Create new map' }).click();
    await page.getByPlaceholder('Name', { exact: true }).fill('Canvas Test Map');
    await page.getByRole('button', { name: 'Create', exact: true }).click();

    await expect(page).toHaveURL(/.*\/map-area\/\d+/);

    const canvas = page.locator('.react-flow');
    await expect(canvas).toBeVisible();

    const box = await canvas.boundingBox();
    expect(box).not.toBeNull();
    if (!box) return;

    await canvas.click({ button: 'right', position: { x: 200, y: 200 } });
    await expect(page.locator('.react-flow__node')).toHaveCount(1);

    await page.waitForTimeout(500);

    await canvas.click({ button: 'right', position: { x: 600, y: 200 } });
    await expect(page.locator('.react-flow__node')).toHaveCount(2);

    const node1 = page.locator('.react-flow__node').nth(0);
    const node2 = page.locator('.react-flow__node').nth(1);

    const handle1 = node1.locator('.react-flow__handle').first();
    const handle2 = node2.locator('.react-flow__handle').first();

    await handle1.dragTo(handle2, { force: true });
    
    await expect(page.locator('.react-flow__edge')).toHaveCount(1);

    await handle2.hover({ force: true });

    await page.mouse.down();

    await page.mouse.move(box.x + 600, box.y + 600, { steps: 10 });
    await page.mouse.up();
    await expect(page.locator('.react-flow__node')).toHaveCount(3);
    await expect(page.locator('.react-flow__edge')).toHaveCount(2);
  });
});