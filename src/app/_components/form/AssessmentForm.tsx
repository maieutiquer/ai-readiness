"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useRef } from "react";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Form } from "~/components/ui/form";
import { toast } from "sonner";
import {
  SelectField,
  RadioGroupField,
  BooleanRadioGroup,
  CheckboxGroup,
} from "./components";
import {
  COMPANY_SIZES,
  INDUSTRIES,
  TECH_STACK_MATURITY_LEVELS,
  DATA_AVAILABILITY_OPTIONS,
  BUDGETS,
  TIMELINES,
  TECHNICAL_EXPERTISE_LEVELS,
  MAIN_BUSINESS_CHALLENGES,
  PRIORITY_AREAS,
  formSchema,
  type FormValues,
} from "./formDefinitions";

export function AssessmentForm() {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dataAvailability: [],
      mainBusinessChallenge: [],
      priorityArea: [],
      ...(process.env.NODE_ENV === "development"
        ? {
            companySize: COMPANY_SIZES[0],
            industry: INDUSTRIES[0],
            techStackMaturity: TECH_STACK_MATURITY_LEVELS[0],
            budgetRange: BUDGETS[0],
            timelineExpectations: TIMELINES[0],
            technicalExpertiseLevel: TECHNICAL_EXPERTISE_LEVELS[0],
            previousAiExperience: false,
          }
        : {}),
    },
  });

  const [aiRecommendations, setAiRecommendations] = useState<string | null>(
    null,
  );
  const recommendationsRef = useRef<HTMLDivElement>(null);

  const { mutate, error, isPending } = api.assessment.create.useMutation({
    onSuccess: (response) => {
      setAiRecommendations(response.data.recommendations);
      toast.success("AI report generated successfully!");

      setTimeout(() => {
        if (recommendationsRef.current) {
          recommendationsRef.current.scrollIntoView({ behavior: "smooth" });
        }
      }, 150);
    },
    onError: (error) => {
      console.error("Error generating AI report:", error);
      toast.error("Error generating AI report, please try again. Error:", {
        description: error.message,
        action: (
          <Button
            type="submit"
            className="animate-button-glow bg-gradient-to-r from-blue-600 to-red-500 text-white hover:from-blue-700 hover:to-red-600"
            onClick={() => {
              mutate(form.getValues());
              toast.dismiss();
            }}
          >
            Retry
          </Button>
        ),
      });
    },
  });

  const onSubmit = (data: FormValues) => {
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
              {isPending ? "Generating AI report..." : "Generate AI report"}
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
        <div ref={recommendationsRef}>
          <Card className="mt-6 dark:bg-slate-900">
            <CardHeader>
              <CardTitle>AI Recommendations:</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="whitespace-pre-wrap">{aiRecommendations}</pre>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
