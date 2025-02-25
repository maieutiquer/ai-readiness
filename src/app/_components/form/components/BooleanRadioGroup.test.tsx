import { describe, it, expect, vi } from "vitest";
import { render, screen } from "~/test/test-utils";
import { BooleanRadioGroup } from "./BooleanRadioGroup";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form } from "~/components/ui/form";

// Create a simple schema for testing
const testSchema = z.object({
  testField: z.boolean().default(false),
});

type TestFormValues = z.infer<typeof testSchema>;

// Mock the FormValues type from formDefinitions
vi.mock("../formDefinitions", () => ({
  formSchema: z.object({
    testField: z.boolean().default(false),
  }),
}));

const TestComponent = () => {
  const form = useForm<TestFormValues>({
    resolver: zodResolver(testSchema),
    defaultValues: {
      testField: false,
    },
  });

  return (
    <Form {...form}>
      <form>
        <BooleanRadioGroup
          // @ts-expect-error - Using test form control with FormValues type
          control={form.control}
          // @ts-expect-error - Using test field name with FormValues type
          name="testField"
          label="Test Label"
          description="Test Description"
        />
      </form>
    </Form>
  );
};

describe("BooleanRadioGroup", () => {
  it("renders with label and description", () => {
    render(<TestComponent />);

    // Check if the label and description are rendered
    expect(screen.getByText("Test Label")).toBeInTheDocument();
    expect(screen.getByText("Test Description")).toBeInTheDocument();

    // Check if the switch is rendered
    const switchElement = screen.getByRole("switch");
    expect(switchElement).toBeInTheDocument();

    // Check if the "No" text is rendered (default value is false)
    expect(screen.getByText("No")).toBeInTheDocument();
  });

  it("toggles between Yes and No when clicked", async () => {
    const { user } = render(<TestComponent />);

    // Initially it should show "No"
    expect(screen.getByText("No")).toBeInTheDocument();

    // Click the switch
    const switchElement = screen.getByRole("switch");
    await user.click(switchElement);

    // Now it should show "Yes"
    expect(screen.getByText("Yes")).toBeInTheDocument();

    // Click the switch again
    await user.click(switchElement);

    // Now it should show "No" again
    expect(screen.getByText("No")).toBeInTheDocument();
  });
});
