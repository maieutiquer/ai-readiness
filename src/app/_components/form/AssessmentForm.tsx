"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Form } from "~/components/ui/form";
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
        <Card className="mt-6 dark:bg-slate-900">
          <CardHeader>
            <CardTitle>AI Recommendations:</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="whitespace-pre-wrap">{aiRecommendations}</pre>
          </CardContent>
        </Card>
      )}
    </>
  );
}
