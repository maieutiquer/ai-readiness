import { describe, it, expect, vi } from "vitest";
import { render, screen } from "~/test/test-utils";
import { RadioGroupField } from "./RadioGroupField";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form } from "~/components/ui/form";

// Create a simple schema for testing
const OPTIONS = [
  "Option 1 - Description 1",
  "Option 2 - Description 2",
  "Option 3 - Description 3",
] as const;
const testSchema = z.object({
  testField: z.enum(OPTIONS),
});

type TestFormValues = z.infer<typeof testSchema>;

// Mock the FormValues type from formDefinitions
vi.mock("../formDefinitions", () => ({
  formSchema: z.object({
    testField: z.enum([
      "Option 1 - Description 1",
      "Option 2 - Description 2",
      "Option 3 - Description 3",
    ]),
  }),
}));

const TestComponent = () => {
  const form = useForm<TestFormValues>({
    resolver: zodResolver(testSchema),
    defaultValues: {
      testField: OPTIONS[0],
    },
  });

  return (
    <Form {...form}>
      <form>
        <RadioGroupField
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

describe("RadioGroupField", () => {
  it("renders with label and options", () => {
    render(<TestComponent />);

    // Check if the label is rendered
    expect(screen.getByText("Test Label")).toBeInTheDocument();

    // Check if all radio options are rendered
    OPTIONS.forEach((option) => {
      expect(screen.getByLabelText(option)).toBeInTheDocument();
    });

    // Check if the first option is selected by default
    expect(screen.getByLabelText(OPTIONS[0])).toBeChecked();
  });

  it("allows selecting different options", async () => {
    const { user } = render(<TestComponent />);

    // Initially the first option should be selected
    expect(screen.getByLabelText(OPTIONS[0])).toBeChecked();

    // Click the second option
    await user.click(screen.getByLabelText(OPTIONS[1]));

    // Now the second option should be checked and the first unchecked
    expect(screen.getByLabelText(OPTIONS[1])).toBeChecked();
    expect(screen.getByLabelText(OPTIONS[0])).not.toBeChecked();

    // Click the third option
    await user.click(screen.getByLabelText(OPTIONS[2]));

    // Now the third option should be checked and the others unchecked
    expect(screen.getByLabelText(OPTIONS[2])).toBeChecked();
    expect(screen.getByLabelText(OPTIONS[0])).not.toBeChecked();
    expect(screen.getByLabelText(OPTIONS[1])).not.toBeChecked();
  });
});
