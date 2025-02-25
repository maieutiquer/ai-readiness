import { Page, expect } from "@playwright/test";

/**
 * Page Object Model for the Assessment Form page
 */
export class AssessmentFormPage {
  readonly page: Page;

  // Selectors
  readonly companySizeSelector = 'label:has-text("Company size")';
  readonly industrySelector = 'label:has-text("Industry")';
  readonly techStackMaturitySelector = "text=Current tech stack maturity (1-5)";
  readonly dataAvailabilitySelector = "text=Data availability";
  readonly optionalFieldsToggleSelector =
    'button:has-text("Show optional fields")';
  readonly hideOptionalFieldsToggleSelector =
    'button:has-text("Hide optional fields")';
  readonly generateReportButtonSelector =
    'button:has-text("Generate AI report")';
  readonly aiReadinessScoreSelector = "text=AI readiness score";
  readonly aiReportSelector = "text=AI Readiness Report";
  readonly followUpQuestionsSelector = "text=Follow-up Questions";
  readonly submitAnswersButtonSelector = 'button:has-text("Submit Answers")';
  readonly yourAnswersSelector = "text=Your Answers";

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navigate to the assessment form page
   */
  async goto() {
    await this.page.goto("/");
  }

  /**
   * Fill out the required fields in the assessment form
   */
  async fillRequiredFields() {
    // Fill company size
    await this.page.getByLabel("Company size").click();
    await this.page.getByRole("option", { name: "1-10 employees" }).click();

    // Fill industry
    await this.page.getByLabel("Industry").click();
    await this.page
      .getByRole("option", { name: "Technology & Software" })
      .click();

    // Select tech stack maturity
    await this.page
      .getByLabel("1 - No digital infrastructure (fully manual processes)")
      .check();

    // Select at least one data availability option
    await this.page
      .getByLabel(
        "We collect structured data (well-organized, databases, etc.)",
      )
      .check();
  }

  /**
   * Show optional fields in the form
   */
  async showOptionalFields() {
    const optionalFieldsToggle = this.page.getByRole("button", {
      name: /show optional fields/i,
    });
    await expect(optionalFieldsToggle).toBeVisible();
    await optionalFieldsToggle.click();
  }

  /**
   * Hide optional fields in the form
   */
  async hideOptionalFields() {
    const hideOptionalFieldsToggle = this.page.getByRole("button", {
      name: /hide optional fields/i,
    });
    await expect(hideOptionalFieldsToggle).toBeVisible();
    await hideOptionalFieldsToggle.click();
  }

  /**
   * Fill out optional fields in the assessment form
   */
  async fillOptionalFields() {
    await this.showOptionalFields();

    // Fill budget range
    await this.page.getByLabel("Budget range").click();
    await this.page.getByRole("option", { name: "Less than $10,000" }).click();

    // Fill timeline expectations
    await this.page.getByLabel("Timeline expectations").click();
    await this.page
      .getByRole("option", { name: "0-3 months (immediate implementation)" })
      .click();

    // Select technical expertise level
    await this.page.getByLabel("1 - No in-house tech expertise").check();

    // Toggle previous AI experience (default is No/false)
    // Find the switch for Previous AI experience and click it to set to Yes
    const previousAiExperienceSection = this.page
      .getByText("Previous AI experience")
      .first();
    const switchElement = previousAiExperienceSection
      .locator("xpath=..")
      .locator("role=switch");
    await switchElement.click();

    // Select main business challenge
    await this.page.getByLabel("Reducing operational costs").check();

    // Select priority area
    await this.page.getByLabel("Data-driven decision-making").check();
  }

  /**
   * Submit the assessment form
   */
  async submitForm() {
    await this.page
      .getByRole("button", { name: /generate ai report/i })
      .click();
  }

  /**
   * Wait for the AI report to be generated
   */
  async waitForReport() {
    await this.page.waitForSelector("text=AI readiness score", {
      timeout: 60000,
    });
  }

  /**
   * Submit the form and wait for results
   */
  async submitFormAndWaitForResults() {
    await this.submitForm();
    await this.waitForReport();
  }

  /**
   * Verify that the AI report is displayed
   */
  async verifyReportDisplayed() {
    const readinessScore = this.page.getByText("AI readiness score");
    await expect(readinessScore).toBeVisible();

    const aiReport = this.page.getByText("AI Readiness Report");
    await expect(aiReport).toBeVisible();
  }

  /**
   * Check if follow-up questions are displayed
   */
  async hasFollowUpQuestions() {
    const followUpQuestionsCard = this.page.getByText("Follow-up Questions");
    return await followUpQuestionsCard.isVisible();
  }

  /**
   * Answer follow-up questions
   * @param answer The answer to provide for all questions
   */
  async answerFollowUpQuestions(
    answer: string = "This is my answer to the follow-up question.",
  ) {
    if (await this.hasFollowUpQuestions()) {
      // Get all input fields for follow-up questions
      const inputFields = this.page.locator("input.flex-1");
      const count = await inputFields.count();

      // Fill in answers for each question
      for (let i = 0; i < count; i++) {
        await inputFields.nth(i).fill(answer);
      }

      // Submit the answers
      await this.page.getByRole("button", { name: /submit answers/i }).click();

      // Wait for the updated report
      await this.page.waitForSelector("text=Your Answers", { timeout: 60000 });

      return true;
    }

    return false;
  }

  /**
   * Verify that the answers are displayed
   */
  async verifyAnswersDisplayed() {
    const yourAnswers = this.page.getByText("Your Answers");
    await expect(yourAnswers).toBeVisible();
  }

  /**
   * Verify that the report has been updated with insights from follow-up questions
   */
  async verifyReportUpdatedWithInsights() {
    const reportContent = this.page.locator(".prose");
    await expect(reportContent).toContainText(
      "INSIGHTS FROM FOLLOW-UP QUESTIONS",
    );
  }
}
