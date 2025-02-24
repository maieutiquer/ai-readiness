"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { api } from "~/trpc/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "~/components/ui/form";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { Checkbox } from "~/components/ui/checkbox";
import { Label } from "~/components/ui/label";

const COMPANY_SIZES = [
  "1-10 employees",
  "11-50 employees",
  "51-200 employees",
  "201-1,000 employees",
  "1,001+ employees",
] as const;
const INDUSTRIES = [
  "Healthcare",
  "Finance & Banking",
  "Retail & E-commerce",
  "Manufacturing",
  "Logistics & Supply Chain",
  "Technology & Software",
  "Government & Public Sector",
  "Education",
  "Energy & Utilities",
  "Other",
] as const;
const TECH_STACK_MATURITY_LEVELS = [
  "1 - No digital infrastructure (fully manual processes)",
  "2 - Basic (Some cloud tools, no AI usage)",
  "3 - Moderate (Using automation, but no AI models)",
  "4 - Advanced (Some AI models in production)",
  "5 - Highly mature (AI deeply integrated in operations)",
] as const;
const DATA_AVAILABILITY_OPTIONS = [
  "We collect structured data (well-organized, databases, etc.)",
  "We collect unstructured data (documents, images, videos, etc.)",
  "We have real-time data streams (IoT, event-driven systems)",
  "We rely on third-party data providers",
  "We have little to no data collection",
] as const;
const BUDGETS = [
  "Less than $10,000",
  "$10,000 - $50,000",
  "$50,000 - $100,000",
  "$100,000 - $500,000",
  "More than $500,000",
] as const;
const TIMELINES = [
  "0-3 months (immediate implementation)",
  "3-6 months",
  "6-12 months",
  "12+ months (long-term plan)",
] as const;
const TECHNICAL_EXPERTISE_LEVELS = [
  "1 - No in-house tech expertise",
  "2 - Some IT staff, but no AI/ML experience",
  "3 - Software team with basic AI/ML knowledge",
  "4 - AI specialists available, but limited experience",
  "5 - Strong AI/ML team with advanced capabilities",
] as const;
const MAIN_BUSINESS_CHALLENGES = [
  "Reducing operational costs",
  "Increasing revenue and sales",
  "Improving customer experience",
  "Enhancing decision-making with AI insights",
  "Optimizing supply chain and logistics",
  "Automating repetitive tasks",
  "Other",
] as const;
const PRIORITY_AREAS = [
  "Data-driven decision-making",
  "Process automation",
  "Customer service automation (e.g., chatbots, voice assistants)",
  "Predictive analytics (forecasting trends, risk assessment)",
  "AI-powered product innovation",
  "Other",
] as const;

export const formSchema = z.object({
  companySize: z.enum(COMPANY_SIZES),
  industry: z.enum(INDUSTRIES),
  techStackMaturity: z.enum(TECH_STACK_MATURITY_LEVELS),
  dataAvailability: z.array(z.enum(DATA_AVAILABILITY_OPTIONS)),
  budgetRange: z.enum(BUDGETS),
  timelineExpectations: z.enum(TIMELINES),
  technicalExpertiseLevel: z.enum(TECHNICAL_EXPERTISE_LEVELS),
  previousAiExperience: z.boolean(),
  mainBusinessChallenge: z.array(z.enum(MAIN_BUSINESS_CHALLENGES)),
  priorityArea: z.array(z.enum(PRIORITY_AREAS)),
});

type FormValues = z.infer<typeof formSchema>;

// Select Field Component
interface SelectFieldProps {
  control: any;
  name: keyof FormValues;
  label: string;
  placeholder: string;
  options: readonly string[];
}

function SelectField({
  control,
  name,
  label,
  placeholder,
  options,
}: SelectFieldProps) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

// Radio Group Field Component
interface RadioGroupFieldProps {
  control: any;
  name: keyof FormValues;
  label: string;
  options: readonly string[];
  className?: string;
}

function RadioGroupField({
  control,
  name,
  label,
  options,
  className = "flex flex-col space-y-1",
}: RadioGroupFieldProps) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="space-y-3">
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <RadioGroup
              onValueChange={field.onChange}
              defaultValue={field.value}
              className={className}
            >
              {options.map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={option} />
                  <Label htmlFor={option}>{option}</Label>
                </div>
              ))}
            </RadioGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

// Boolean Radio Group Component
interface BooleanRadioGroupProps {
  control: any;
  name: keyof FormValues;
  label: string;
  className?: string;
}

function BooleanRadioGroup({
  control,
  name,
  label,
  className = "flex gap-4",
}: BooleanRadioGroupProps) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="space-y-3">
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <RadioGroup
              onValueChange={(value) => field.onChange(value === "true")}
              defaultValue={field.value ? "true" : "false"}
              className={className}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="true" id={`${name}-yes`} />
                <Label htmlFor={`${name}-yes`}>Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="false" id={`${name}-no`} />
                <Label htmlFor={`${name}-no`}>No</Label>
              </div>
            </RadioGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

// Checkbox Group Component
interface CheckboxGroupProps {
  control: any;
  name: keyof FormValues;
  label: string;
  options: readonly string[];
}

function CheckboxGroup({ control, name, label, options }: CheckboxGroupProps) {
  return (
    <FormField
      control={control}
      name={name}
      render={() => (
        <FormItem>
          <div className="mb-4">
            <FormLabel className="text-base">{label}</FormLabel>
          </div>
          {options.map((option) => (
            <FormField
              key={option}
              control={control}
              name={name}
              render={({ field }) => {
                return (
                  <FormItem
                    key={option}
                    className="flex flex-row items-start space-x-3 space-y-0"
                  >
                    <FormControl>
                      <Checkbox
                        checked={field.value?.includes(option)}
                        onCheckedChange={(checked) => {
                          // Fix for the bug: ensure field.value is an array before spreading
                          const currentValue = Array.isArray(field.value)
                            ? field.value
                            : [];
                          return checked
                            ? field.onChange([...currentValue, option])
                            : field.onChange(
                                currentValue.filter(
                                  (value) => value !== option,
                                ),
                              );
                        }}
                      />
                    </FormControl>
                    <FormLabel className="font-normal">{option}</FormLabel>
                  </FormItem>
                );
              }}
            />
          ))}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export function AssessmentForm() {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dataAvailability: [],
      mainBusinessChallenge: [],
      priorityArea: [],
      previousAiExperience: false,
    },
  });

  const [aiRecommendations, setAiRecommendations] = useState<string | null>(
    null,
  );

  const { mutate, error, isPending } = api.assessment.create.useMutation({
    onSuccess: (response) => {
      console.log("Success response:", response);
      setAiRecommendations(response.data.recommendations);
    },
    onError: (error) => {
      console.error("Error submitting form:", error);
    },
  });

  const onSubmit = (data: FormValues) => {
    console.log("Submitting form data:", data);
    mutate(data);
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <SelectField
            control={form.control}
            name="companySize"
            label="Company size"
            placeholder="Select company size"
            options={COMPANY_SIZES}
          />

          <SelectField
            control={form.control}
            name="industry"
            label="Industry"
            placeholder="Select industry"
            options={INDUSTRIES}
          />

          <RadioGroupField
            control={form.control}
            name="techStackMaturity"
            label="Current tech stack maturity (1-5)"
            options={TECH_STACK_MATURITY_LEVELS}
          />

          <CheckboxGroup
            control={form.control}
            name="dataAvailability"
            label="Data availability"
            options={DATA_AVAILABILITY_OPTIONS}
          />

          <SelectField
            control={form.control}
            name="budgetRange"
            label="Budget range"
            placeholder="Select budget"
            options={BUDGETS}
          />

          <SelectField
            control={form.control}
            name="timelineExpectations"
            label="Timeline expectations"
            placeholder="Select timeline"
            options={TIMELINES}
          />

          <RadioGroupField
            control={form.control}
            name="technicalExpertiseLevel"
            label="Technical expertise level (1-5)"
            options={TECHNICAL_EXPERTISE_LEVELS}
          />

          <BooleanRadioGroup
            control={form.control}
            name="previousAiExperience"
            label="Previous AI experience"
          />

          <CheckboxGroup
            control={form.control}
            name="mainBusinessChallenge"
            label="Main business challenge"
            options={MAIN_BUSINESS_CHALLENGES}
          />

          <CheckboxGroup
            control={form.control}
            name="priorityArea"
            label="Priority area"
            options={PRIORITY_AREAS}
          />

          <div className="flex justify-between">
            <Button
              type="submit"
              disabled={isPending}
              className="animate-button-glow bg-gradient-to-r from-blue-600 to-red-500 text-white hover:from-blue-700 hover:to-red-600"
            >
              {isPending ? "Submitting..." : "Submit"}
            </Button>
          </div>

          {error && (
            <p className="text-sm text-red-500">
              {error.message || "An error occurred"}
            </p>
          )}
        </form>
      </Form>

      {aiRecommendations && (
        <Card className="mt-6 dark:bg-slate-900">
          <CardHeader>
            <CardTitle>AI Recommendations:</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{aiRecommendations}</p>
          </CardContent>
        </Card>
      )}
    </>
  );
}
