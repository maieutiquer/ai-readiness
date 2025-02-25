import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "~/test/test-utils";
import { AssessmentForm } from "./AssessmentForm";

// Mock the API
vi.mock("~/trpc/react", () => {
  const mockMutate = vi.fn().mockImplementation(() => {
    return Promise.resolve({
      data: {
        recommendations: "Mock AI recommendations for testing",
      },
    });
  });

  return {
    api: {
      assessment: {
        create: {
          useMutation: () => ({
            mutate: mockMutate,
            error: null,
            isPending: false,
          }),
        },
      },
    },
  };
});

// Mock the toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    dismiss: vi.fn(),
  },
}));

describe("AssessmentForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the form with all fields", () => {
    render(<AssessmentForm />);

    // Check if all form sections are rendered
    expect(screen.getByText("Company size")).toBeInTheDocument();
    expect(screen.getByText("Industry")).toBeInTheDocument();
    expect(
      screen.getByText("Current tech stack maturity (1-5)"),
    ).toBeInTheDocument();
    expect(screen.getByText("Data availability")).toBeInTheDocument();
    expect(screen.getByText("Budget range")).toBeInTheDocument();
    expect(screen.getByText("Timeline expectations")).toBeInTheDocument();
    expect(
      screen.getByText("Technical expertise level (1-5)"),
    ).toBeInTheDocument();
    expect(screen.getByText("Previous AI experience")).toBeInTheDocument();
    expect(screen.getByText("Main business challenge")).toBeInTheDocument();
    expect(screen.getByText("Priority area")).toBeInTheDocument();

    // Check if the submit button is rendered
    expect(
      screen.getByRole("button", { name: /generate ai report/i }),
    ).toBeInTheDocument();
  });

  it.skip("submits the form and displays recommendations", async () => {
    const { user } = render(<AssessmentForm />);

    // Fill out the form (minimal required fields)
    // Select company size
    const companySizeSelect = screen.getByLabelText("Company size");
    await user.click(companySizeSelect);
    await user.click(screen.getByText("1-10 employees"));

    // Select industry
    const industrySelect = screen.getByLabelText("Industry");
    await user.click(industrySelect);
    await user.click(screen.getByText("Healthcare"));

    // Select tech stack maturity
    await user.click(
      screen.getByLabelText(
        "1 - No digital infrastructure (fully manual processes)",
      ),
    );

    // Select data availability (at least one)
    await user.click(
      screen.getByLabelText(
        "We collect structured data (well-organized, databases, etc.)",
      ),
    );

    // Select budget range
    const budgetSelect = screen.getByLabelText("Budget range");
    await user.click(budgetSelect);
    await user.click(screen.getByText("Less than $10,000"));

    // Select timeline expectations
    const timelineSelect = screen.getByLabelText("Timeline expectations");
    await user.click(timelineSelect);
    await user.click(screen.getByText("0-3 months (immediate implementation)"));

    // Select technical expertise level
    await user.click(screen.getByLabelText("1 - No in-house tech expertise"));

    // Select main business challenge (at least one)
    await user.click(screen.getByLabelText("Reducing operational costs"));

    // Select priority area (at least one)
    await user.click(screen.getByLabelText("Data-driven decision-making"));

    // Submit the form
    await user.click(
      screen.getByRole("button", { name: /generate ai report/i }),
    );

    // Wait for the recommendations to be displayed
    await waitFor(() => {
      expect(screen.getByText("AI Recommendations:")).toBeInTheDocument();
      expect(
        screen.getByText("Mock AI recommendations for testing"),
      ).toBeInTheDocument();
    });
  });
});
