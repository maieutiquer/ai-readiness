import { test, expect } from "@playwright/test";
import {
  fillRequiredFields,
  fillOptionalFields,
  submitFormAndWaitForResults,
  verifyReportDisplayed,
} from "./utils";

test.describe("Complete Assessment Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the home page before each test
    await page.goto("/");
  });

  test("should complete assessment with only required fields", async ({
    page,
  }) => {
    // Fill out required fields
    await fillRequiredFields(page);

    // Submit form and wait for results
    await submitFormAndWaitForResults(page);

    // Verify report is displayed
    await verifyReportDisplayed(page);
  });

  test.skip("should complete assessment with all fields", async ({ page }) => {
    // Fill out required fields
    await fillRequiredFields(page);

    // Fill out optional fields
    await fillOptionalFields(page);

    // Submit form and wait for results
    await submitFormAndWaitForResults(page);

    // Verify report is displayed
    await verifyReportDisplayed(page);

    // Additional verification for a more comprehensive report
    // The report should contain more detailed information when all fields are filled
    const reportContent = page.locator(".prose");
    await expect(reportContent).toContainText("INSIGHTS");
  });

  test.skip("should handle form validation", async ({ page }) => {
    // Try to submit the form without filling required fields
    await page.getByRole("button", { name: /generate ai report/i }).click();

    // Expect validation errors to be displayed
    // Note: This assumes the form uses client-side validation
    // If it doesn't, this test might need to be adjusted
    await expect(page.getByText(/please select an option/i)).toBeVisible();
  });
});
