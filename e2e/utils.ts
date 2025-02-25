import { Page, expect } from "@playwright/test";

/**
 * Fill out the required fields in the assessment form
 */
export async function fillRequiredFields(page: Page): Promise<void> {
  // Fill company size
  await page.getByLabel("Company size").click();
  await page.getByRole("option", { name: "1-10 employees" }).click();

  // Fill industry
  await page.getByLabel("Industry").click();
  await page.getByRole("option", { name: "Technology & Software" }).click();

  // Select tech stack maturity
  await page
    .getByLabel("1 - No digital infrastructure (fully manual processes)")
    .check();

  // Select at least one data availability option
  await page
    .getByLabel("We collect structured data (well-organized, databases, etc.)")
    .check();
}

/**
 * Show optional fields in the form
 */
export async function showOptionalFields(page: Page): Promise<void> {
  const optionalFieldsToggle = page.getByRole("button", {
    name: /show optional fields/i,
  });
  await expect(optionalFieldsToggle).toBeVisible();
  await optionalFieldsToggle.click();
}

/**
 * Fill out optional fields in the assessment form
 */
export async function fillOptionalFields(page: Page): Promise<void> {
  await showOptionalFields(page);

  // Fill budget range
  await page.getByLabel("Budget range").click();
  await page.getByRole("option", { name: "Less than $10,000" }).click();

  // Fill timeline expectations
  await page.getByLabel("Timeline expectations").click();
  await page
    .getByRole("option", { name: "0-3 months (immediate implementation)" })
    .click();

  // Select technical expertise level
  await page.getByLabel("1 - No in-house tech expertise").check();

  // Toggle previous AI experience (default is No/false)
  // Find the switch for Previous AI experience and click it to set to Yes
  const previousAiExperienceSection = page
    .getByText("Previous AI experience")
    .first();
  const switchElement = previousAiExperienceSection
    .locator("xpath=..")
    .locator("role=switch");
  await switchElement.click();

  // Select main business challenge
  await page.getByLabel("Reducing operational costs").check();

  // Select priority area
  await page.getByLabel("Data-driven decision-making").check();
}

/**
 * Submit the assessment form and wait for results
 */
export async function submitFormAndWaitForResults(page: Page): Promise<void> {
  // Submit the form
  await page.getByRole("button", { name: /generate ai report/i }).click();

  // Wait for the report to be generated (this might take some time)
  await page.waitForSelector("text=AI readiness score", { timeout: 60000 });
}

/**
 * Verify that the AI report is displayed
 */
export async function verifyReportDisplayed(page: Page): Promise<void> {
  const readinessScore = page.getByText("AI readiness score");
  await expect(readinessScore).toBeVisible();

  const aiReport = page.getByText("AI Readiness Report");
  await expect(aiReport).toBeVisible();
}
