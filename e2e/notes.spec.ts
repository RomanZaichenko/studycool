import { test, expect } from "@playwright/test";
import path from "path";

test.describe("Note Editor E2E Flow", () => {
  test("should create a note with image, save it on close, and persist data", async ({
    page,
  }) => {
    await page.goto("http://localhost:3000/project-area/1");

    await page.getByRole("button", { name: /add note/i }).click();

    const titleInput = page.getByPlaceholder("Note title");
    const contentInput = page.getByPlaceholder("Start typing your note...");

    await titleInput.fill("Research on AI Ethics");
    await contentInput.fill(
      "This note contains important thoughts on future regulations."
    );

    const fileChooserPromise = page.waitForEvent("filechooser");
    await page.getByTestId("image-placeholder").click();
    const fileChooser = await fileChooserPromise;

    await fileChooser.setFiles(
      path.join(__dirname, "test-assets/sample-image.png")
    );

    const previewImage = page.locator('[data-testid="image-placeholder"] img');
    await expect(previewImage).toBeVisible();

    await page.getByLabel("Close note").click();

    const noteCard = page.locator("text=Research on AI Ethics");
    await expect(noteCard).toBeVisible();

    await noteCard.click();

    await expect(page.getByPlaceholder("Note title")).toHaveValue(
      "Research on AI Ethics"
    );
    await expect(
      page.getByPlaceholder("Start typing your note...")
    ).toHaveValue(
      "This note contains important thoughts on future regulations."
    );
    await expect(
      page.locator('[data-testid="image-placeholder"] img')
    ).toBeVisible();
  });

  test("should not save note if title is empty (validation check)", async ({
    page,
  }) => {
    await page.goto("http://localhost:3000/project-area/1");
    await page.getByRole("button", { name: /add note/i }).click();
    await page
      .getByPlaceholder("Start typing your note...")
      .fill("Ghost note content");

    await page.getByLabel("Close note").click();
    await expect(page.locator("text=Ghost note content")).not.toBeVisible();
  });
});
