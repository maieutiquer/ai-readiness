# End-to-End Testing with Playwright

This directory contains end-to-end tests for the AI Readiness application using Playwright.

## Setup

The tests are already configured in the project. Playwright is installed as a dev dependency, and the browsers are installed using the Playwright CLI.

## Running Tests

### Locally

To run the tests locally, you need to have the application running in development mode. You can do this by running:

```bash
# Start the database (if needed)
./start-database.sh

# Start the application
pnpm run dev
```

Then, in a separate terminal, you can run the tests:

```bash
# Run all tests
pnpm run test:e2e

# Run tests with UI mode (for debugging)
pnpm run test:e2e:ui

# Run tests in debug mode
pnpm run test:e2e:debug

# Show the HTML report of the last test run
pnpm run test:e2e:report
```

### In CI

The tests are automatically run in GitHub Actions on push to the main branch and on pull requests. The workflow is defined in `.github/workflows/node.js.yml`.

## Test Structure

The tests are organized as follows:

- `home.spec.ts`: Tests for the home page
- `assessment-form.spec.ts`: Tests for the assessment form
- `complete-assessment.spec.ts`: Tests for the complete assessment flow
- `follow-up-questions.spec.ts`: Tests for the follow-up questions functionality
- `utils.ts`: Utility functions for the tests

## Best Practices

1. **Use Page Objects**: The tests use utility functions to encapsulate common actions, making the tests more maintainable.

2. **Test Isolation**: Each test is isolated and does not depend on the state of other tests.

3. **Retry Flaky Tests**: The tests are configured to retry on CI, which helps with flaky tests.

4. **Parallel Execution**: The tests can be run in parallel, which speeds up the test execution.

5. **Screenshots and Videos**: The tests are configured to take screenshots on failure and record videos on retry, which helps with debugging.

6. **CI Integration**: The tests are integrated with GitHub Actions, which ensures that they are run on every push and pull request.

7. **Artifacts**: The test results are uploaded as artifacts in GitHub Actions, which makes it easy to inspect the results.

## Troubleshooting

If you encounter issues with the tests, try the following:

1. Run the tests in UI mode to see what's happening: `pnpm run test:e2e:ui`
2. Run the tests in debug mode: `pnpm run test:e2e:debug`
3. Check the test report: `pnpm run test:e2e:report`
4. Make sure the application is running in development mode: `pnpm run dev`
5. Make sure the database is running and properly configured
