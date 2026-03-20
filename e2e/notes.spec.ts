import { test, expect } from "@playwright/test";

test.describe("Note Editor E2E Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3000/map-area/1");

    const canvas = page.locator(".react-flow__renderer");
    await canvas.click({ button: "right", position: { x: 300, y: 300 } });

    await expect(page.locator(".react-flow__node").first()).toBeVisible();
  });

  test("should open note editor on node click, save content, and persist data", async ({ page }) => {
    const node = page.locator(".react-flow__node").first();
    const editorOverlay = page.locator(".fixed.inset-0");
    const titleInput = page.getByPlaceholder("Note title");
    const tiptapEditor = page.locator('[contenteditable="true"]');
    const closeButton = page.getByLabel("Close note");

    await node.click();
    await expect(editorOverlay).toBeVisible();

    await titleInput.fill("Knowledge Node 1");
    await tiptapEditor.fill("This info is linked to node 1");

    await closeButton.click();
    await expect(editorOverlay).not.toBeVisible();

    await node.click();
    await expect(titleInput).toHaveValue("Knowledge Node 1");
    await expect(tiptapEditor).toContainText("This info is linked to node 1");
  });

  test("should insert image directly into the text content", async ({ page }) => {
    const node = page.locator(".react-flow__node").first();
    const tiptapEditor = page.locator('[contenteditable="true"]');
    const fileInput = page.locator('input[type="file"]');

    await node.click();

    await tiptapEditor.fill("This is my text before the image.");

    await fileInput.setInputFiles("./e2e/assets/test-image.png");

    await expect(tiptapEditor.locator("img")).toBeVisible();

    await page.getByLabel("Close note").click();
  });
});