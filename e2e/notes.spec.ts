import { test, expect } from "@playwright/test";

test.describe("Note Editor E2E Flow", () => {
  test("should open note editor on node click and save content to that specific node", async ({
    page,
  }) => {
    await page.goto("http://localhost:3000/map-area/1");

    const canvas = page.locator(".react-flow__renderer");
    await canvas.click({ button: "right", position: { x: 300, y: 300 } });

    const node = page.locator(".react-flow__node").first();
    await node.click();

    const editor = page.locator('div[role="dialog"]');
    await expect(editor).toBeVisible();

    await page.getByPlaceholder("Note title").fill("Knowledge Node 1");
    await page
      .getByPlaceholder("Start typing your note...")
      .fill("This info is linked to node 1");

    await page.getByLabel("Close note").click();

    await expect(editor).not.toBeVisible();
    await expect(canvas).toBeVisible();

    await node.click();
    await expect(page.getByPlaceholder("Note title")).toHaveValue(
      "Knowledge Node 1"
    );
  });

  test('should insert image directly into the text content', async ({ page }) => {
  await page.goto('http://localhost:3000/map-area/1');
  await page.locator('.react-flow__node').first().click();


  const editor = page.locator('[contenteditable="true"]');
  
  await editor.fill('This is my text before the image.');

  const fileChooserPromise = page.waitForEvent('filechooser');
  await page.getByLabel('Insert image').click(); 
  const fileChooser = await fileChooserPromise;
  await fileChooser.setFiles('./e2e/assets/test-image.png');


  await expect(editor.locator('img')).toBeVisible();
  
  await page.getByLabel('Close note').click();
});
});
