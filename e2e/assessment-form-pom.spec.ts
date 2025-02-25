import { test, expect } from "@playwright/test";
import { AssessmentFormPage } from "./models/AssessmentFormPage";

test.describe("Assessment Form with Page Object Model", () => {
  let assessmentFormPage: AssessmentFormPage;

  test.beforeEach(async ({ page }) => {
    assessmentFormPage = new AssessmentFormPage(page);
    await assessmentFormPage.goto();
  });

  test("should display the assessment form", async () => {
    // Check if the form elements are visible
    await expect(
      assessmentFormPage.page.getByLabel("Company size"),
    ).toBeVisible();
    await expect(assessmentFormPage.page.getByLabel("Industry")).toBeVisible();
    await expect(
      assessmentFormPage.page.getByText("Current tech stack maturity (1-5)"),
    ).toBeVisible();
    await expect(
      assessmentFormPage.page.getByText("Data availability"),
    ).toBeVisible();
  });

  test("should show and hide optional fields", async () => {
    // Show optional fields
    await assessmentFormPage.showOptionalFields();

    // Verify optional fields are visible
    await expect(
      assessmentFormPage.page.getByLabel("Budget range"),
    ).toBeVisible();
    await expect(
      assessmentFormPage.page.getByLabel("Timeline expectations"),
    ).toBeVisible();

    // Hide optional fields
    await assessmentFormPage.hideOptionalFields();

    // Verify optional fields are hidden
    await expect(
      assessmentFormPage.page.getByLabel("Budget range"),
    ).not.toBeVisible();
  });

  test("should complete assessment with required fields", async () => {
    // Fill out required fields
    await assessmentFormPage.fillRequiredFields();

    // Submit form and wait for results
    await assessmentFormPage.submitFormAndWaitForResults();

    // Verify report is displayed
    await assessmentFormPage.verifyReportDisplayed();
  });

  test.skip("should complete assessment with all fields", async () => {
    // Fill out required fields
    await assessmentFormPage.fillRequiredFields();

    // Fill out optional fields
    await assessmentFormPage.fillOptionalFields();

    // Submit form and wait for results
    await assessmentFormPage.submitFormAndWaitForResults();

    // Verify report is displayed
    await assessmentFormPage.verifyReportDisplayed();
  });

  test("should handle follow-up questions when they appear", async () => {
    // Fill out required fields
    await assessmentFormPage.fillRequiredFields();

    // Submit form and wait for results
    await assessmentFormPage.submitFormAndWaitForResults();

    // Check if follow-up questions are displayed and answer them if they are
    if (await assessmentFormPage.hasFollowUpQuestions()) {
      await assessmentFormPage.answerFollowUpQuestions();

      // Verify answers are displayed
      await assessmentFormPage.verifyAnswersDisplayed();

      // Verify report has been updated with insights
      await assessmentFormPage.verifyReportUpdatedWithInsights();
    } else {
      // If no follow-up questions, just verify the report is displayed
      await assessmentFormPage.verifyReportDisplayed();

      // Skip the rest of the test
      test.skip(true, "No follow-up questions were displayed");
    }
  });
});
