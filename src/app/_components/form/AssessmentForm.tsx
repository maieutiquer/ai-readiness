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

export function AssessmentForm() {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
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
          <FormField
            control={form.control}
            name="companySize"
            render={({ field }) => (
              <>
                <FormItem>
                  <FormLabel>Company size</FormLabel>
                  <Select onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select company size" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {COMPANY_SIZES.map((size) => (
                        <SelectItem key={size} value={size}>
                          {size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>

                <FormField
                  control={form.control}
                  name="industry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Industry</FormLabel>
                      <Select onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select industry" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {INDUSTRIES.map((industry) => (
                            <SelectItem key={industry} value={industry}>
                              {industry}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="techStackMaturity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current tech stack maturity (1-5)</FormLabel>
                      <div>
                        {TECH_STACK_MATURITY_LEVELS.map((value) => (
                          <FormControl key={value}>
                            <div className="flex items-center space-x-2">
                              <input
                                type="radio"
                                value={value}
                                checked={field.value === value}
                                onChange={() => field.onChange(value)}
                              />
                              <label>{value}</label>
                            </div>
                          </FormControl>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dataAvailability"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data availability</FormLabel>
                      <div className="space-y-2">
                        {DATA_AVAILABILITY_OPTIONS.map((option) => (
                          <FormControl key={option}>
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={field.value?.includes(option)}
                                onChange={(e) => {
                                  const updatedValue = e.target.checked
                                    ? [...(field.value || []), option]
                                    : field.value?.filter(
                                        (val: string) => val !== option,
                                      ) || [];
                                  field.onChange(updatedValue);
                                }}
                                className="h-4 w-4"
                              />
                              <label>{option}</label>
                            </div>
                          </FormControl>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="budgetRange"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Budget range</FormLabel>
                      <Select onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select budget" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {BUDGETS.map((budget) => (
                            <SelectItem key={budget} value={budget}>
                              {budget}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="timelineExpectations"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Timeline expectations</FormLabel>
                      <Select onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select timeline" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {TIMELINES.map((timeline) => (
                            <SelectItem key={timeline} value={timeline}>
                              {timeline}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="technicalExpertiseLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Technical expertise level (1-5)</FormLabel>
                      <div>
                        {TECHNICAL_EXPERTISE_LEVELS.map((value) => (
                          <FormControl key={value}>
                            <div className="flex items-center space-x-2">
                              <input
                                type="radio"
                                value={value}
                                checked={field.value === value}
                                onChange={() => field.onChange(value)}
                                className="h-4 w-4"
                              />
                              <label>{value}</label>
                            </div>
                          </FormControl>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="mainBusinessChallenge"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Main business challenge</FormLabel>
                      <div className="space-y-2">
                        {MAIN_BUSINESS_CHALLENGES.map((option) => (
                          <FormControl key={option}>
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={field.value?.includes(option)}
                                onChange={(e) => {
                                  const updatedValue = e.target.checked
                                    ? [...(field.value || []), option]
                                    : field.value?.filter(
                                        (val: string) => val !== option,
                                      ) || [];
                                  field.onChange(updatedValue);
                                }}
                                className="h-4 w-4"
                              />
                              <label>{option}</label>
                            </div>
                          </FormControl>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="previousAiExperience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Previous AI experience</FormLabel>
                      <div className="flex gap-4">
                        <FormControl>
                          <div className="flex items-center space-x-2">
                            <input
                              type="radio"
                              checked={field.value === true}
                              onChange={() => field.onChange(true)}
                              className="h-4 w-4"
                            />
                            <label>Yes</label>
                          </div>
                        </FormControl>
                        <FormControl>
                          <div className="flex items-center space-x-2">
                            <input
                              type="radio"
                              checked={field.value === false}
                              onChange={() => field.onChange(false)}
                              className="h-4 w-4"
                            />
                            <label>No</label>
                          </div>
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="priorityArea"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority area</FormLabel>
                      <div className="space-y-2">
                        {PRIORITY_AREAS.map((option) => (
                          <FormControl key={option}>
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={field.value?.includes(option)}
                                onChange={(e) => {
                                  const updatedValue = e.target.checked
                                    ? [...(field.value || []), option]
                                    : field.value?.filter(
                                        (val: string) => val !== option,
                                      ) || [];
                                  field.onChange(updatedValue);
                                }}
                                className="h-4 w-4"
                              />
                              <label>{option}</label>
                            </div>
                          </FormControl>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
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
