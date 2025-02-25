import { describe, it, expect, vi } from "vitest";
import { render, screen } from "~/test/test-utils";
import { SelectField } from "./SelectField";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form } from "~/components/ui/form";

// Create a simple schema for testing
const OPTIONS = ["Option 1", "Option 2", "Option 3"] as const;
const testSchema = z.object({
  testField: z.enum(OPTIONS),
});

type TestFormValues = z.infer<typeof testSchema>;

// Mock the FormValues type from formDefinitions
vi.mock("../formDefinitions", () => ({
  formSchema: z.object({
    testField: z.enum(["Option 1", "Option 2", "Option 3"]),
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
        <SelectField
          // @ts-expect-error - Using test form control with FormValues type
          control={form.control}
          // @ts-expect-error - Using test field name with FormValues type
          name="testField"
          label="Test Label"
          placeholder="Select an option"
          options={OPTIONS}
        />
      </form>
    </Form>
  );
};

describe("SelectField", () => {
  it("renders with label and placeholder", () => {
    render(<TestComponent />);

    // Check if the label is rendered
    expect(screen.getByText("Test Label")).toBeInTheDocument();

    // Check if the select is rendered with the default value
    const selectElement = screen.getByRole("combobox");
    expect(selectElement).toBeInTheDocument();
    expect(selectElement).toHaveTextContent("Option 1");
  });
});
