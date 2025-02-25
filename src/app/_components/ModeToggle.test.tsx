import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "~/test/test-utils";
import { ModeToggle } from "./ModeToggle";

// Create a mock for useTheme
const mockSetTheme = vi.fn();

// Mock the next-themes module
vi.mock("next-themes", () => ({
  useTheme: () =>
    ({
      setTheme: mockSetTheme,
      theme: "light",
    }) as const,
}));

describe("ModeToggle", () => {
  beforeEach(() => {
    mockSetTheme.mockClear();
  });

  it("renders the theme toggle button", () => {
    render(<ModeToggle />);

    // Check if the button is rendered
    const button = screen.getByRole("button", { name: /toggle theme/i });
    expect(button).toBeInTheDocument();
  });

  it("changes theme when menu items are clicked", async () => {
    const { user } = render(<ModeToggle />);

    // Open the dropdown menu
    const button = screen.getByRole("button", { name: /toggle theme/i });
    await user.click(button);

    // Click on the light theme option
    const lightOption = screen.getByText("Light");
    await user.click(lightOption);
    expect(mockSetTheme).toHaveBeenCalledWith("light");

    // Reset mock and open dropdown again
    mockSetTheme.mockClear();
    await user.click(button);

    // Click on the dark theme option
    const darkOption = screen.getByText("Dark");
    await user.click(darkOption);
    expect(mockSetTheme).toHaveBeenCalledWith("dark");

    // Reset mock and open dropdown again
    mockSetTheme.mockClear();
    await user.click(button);

    // Click on the system theme option
    const systemOption = screen.getByText("System");
    await user.click(systemOption);
    expect(mockSetTheme).toHaveBeenCalledWith("system");
  });
});
