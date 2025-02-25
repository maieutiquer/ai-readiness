import { describe, it, expect, vi } from "vitest";
import { render, screen } from "~/test/test-utils";
import { CheckboxGroup } from "./CheckboxGroup";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form } from "~/components/ui/form";

// Create a simple schema for testing
const OPTIONS = ["Option 1", "Option 2", "Option 3"] as const;
const testSchema = z.object({
  testField: z.array(z.enum(OPTIONS)),
});

type TestFormValues = z.infer<typeof testSchema>;

// Mock the FormValues type from formDefinitions
vi.mock("../formDefinitions", () => ({
  formSchema: z.object({
    testField: z.array(z.enum(["Option 1", "Option 2", "Option 3"])),
  }),
}));

const TestComponent = () => {
  const form = useForm<TestFormValues>({
    resolver: zodResolver(testSchema),
    defaultValues: {
      testField: [],
    },
  });

  return (
    <Form {...form}>
      <form>
        <CheckboxGroup
          // @ts-expect-error - Using test form control with FormValues type
          control={form.control}
          // @ts-expect-error - Using test field name with FormValues type
          name="testField"
          label="Test Label"
          options={OPTIONS}
        />
      </form>
    </Form>
  );
};

describe("CheckboxGroup", () => {
  it("renders with label and options", () => {
    render(<TestComponent />);

    // Check if the label is rendered
    expect(screen.getByText("Test Label")).toBeInTheDocument();

    // Check if all checkbox options are rendered
    OPTIONS.forEach((option) => {
      expect(screen.getByLabelText(option)).toBeInTheDocument();
    });

    // Check that no options are selected by default
    OPTIONS.forEach((option) => {
      expect(screen.getByLabelText(option)).not.toBeChecked();
    });
  });

  it("allows selecting multiple options", async () => {
    const { user } = render(<TestComponent />);

    // Initially no options should be selected
    OPTIONS.forEach((option) => {
      expect(screen.getByLabelText(option)).not.toBeChecked();
    });

    // Click the first option
    await user.click(screen.getByLabelText(OPTIONS[0]));

    // Now the first option should be checked
    expect(screen.getByLabelText(OPTIONS[0])).toBeChecked();
    expect(screen.getByLabelText(OPTIONS[1])).not.toBeChecked();
    expect(screen.getByLabelText(OPTIONS[2])).not.toBeChecked();

    // Click the second option
    await user.click(screen.getByLabelText(OPTIONS[1]));

    // Now both first and second options should be checked
    expect(screen.getByLabelText(OPTIONS[0])).toBeChecked();
    expect(screen.getByLabelText(OPTIONS[1])).toBeChecked();
    expect(screen.getByLabelText(OPTIONS[2])).not.toBeChecked();

    // Click the first option again to uncheck it
    await user.click(screen.getByLabelText(OPTIONS[0]));

    // Now only the second option should be checked
    expect(screen.getByLabelText(OPTIONS[0])).not.toBeChecked();
    expect(screen.getByLabelText(OPTIONS[1])).toBeChecked();
    expect(screen.getByLabelText(OPTIONS[2])).not.toBeChecked();
  });
});
