import { test, expect } from "@playwright/test";
import { fillRequiredFields, submitFormAndWaitForResults } from "./utils";

test.describe("Follow-up Questions", () => {
  // This test is marked as flaky because follow-up questions may not always appear
  // depending on the AI's decision
  test("should handle follow-up questions when they appear", async ({
    page,
  }) => {
    // Navigate to the home page
    await page.goto("/");

    // Fill out required fields
    await fillRequiredFields(page);

    // Submit form and wait for results
    await submitFormAndWaitForResults(page);

    // Check if follow-up questions are displayed
    const followUpQuestionsCard = page.getByText("Follow-up Questions");

    // If follow-up questions are displayed, answer them
    if (await followUpQuestionsCard.isVisible()) {
      // Get all input fields for follow-up questions
      const inputFields = page.locator("input.flex-1");
      const count = await inputFields.count();

      // Fill in answers for each question
      for (let i = 0; i < count; i++) {
        await inputFields
          .nth(i)
          .fill("This is my answer to the follow-up question.");
      }

      // Submit the answers
      await page.getByRole("button", { name: /submit answers/i }).click();

      // Wait for the updated report
      await page.waitForSelector("text=Your Answers", { timeout: 60000 });

      // Verify the answers are displayed
      const yourAnswers = page.getByText("Your Answers");
      await expect(yourAnswers).toBeVisible();

      // Verify the report has been updated
      const reportContent = page.locator(".prose");
      await expect(reportContent).toContainText(
        "INSIGHTS FROM FOLLOW-UP QUESTIONS",
      );
    } else {
      // If no follow-up questions, just verify the report is displayed
      const aiReport = page.getByText("AI Readiness Report");
      await expect(aiReport).toBeVisible();

      // Skip the rest of the test
      test.skip(true, "No follow-up questions were displayed");
    }
  });
});
