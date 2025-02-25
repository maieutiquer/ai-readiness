import { test, expect } from "@playwright/test";

test.describe("Home Page", () => {
  test("should load the home page successfully", async ({ page }) => {
    // Navigate to the home page
    await page.goto("/");

    // Verify the page has loaded by checking for expected content
    await expect(page).toHaveTitle(/Create T3 App/);
  });

  test("should have a theme toggle button", async ({ page }) => {
    // Navigate to the home page
    await page.goto("/");

    // Find the theme toggle button
    const themeToggle = page.getByRole("button", { name: /toggle theme/i });

    // Verify it exists
    await expect(themeToggle).toBeVisible();

    // Click the theme toggle to ensure it's clickable
    await themeToggle.click();
  });
});
