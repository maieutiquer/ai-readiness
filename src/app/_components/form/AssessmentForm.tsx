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
import { calculateAiReadinessScore } from "./scoring";
import { Progress } from "~/components/ui/progress";

export function AssessmentForm() {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dataAvailability: [],
      mainBusinessChallenge: [],
      priorityArea: [],
      previousAiExperience: false,
      ...(process.env.NODE_ENV === "development"
        ? {
            companySize: COMPANY_SIZES[0],
            industry: INDUSTRIES[0],
            techStackMaturity: TECH_STACK_MATURITY_LEVELS[0],
            budgetRange: BUDGETS[0],
            timelineExpectations: TIMELINES[0],
            technicalExpertiseLevel: TECHNICAL_EXPERTISE_LEVELS[0],
          }
        : {}),
    },
  });

  const [aiRecommendations, setAiRecommendations] = useState<string | null>(
    null,
  );
  const [readinessScore, setReadinessScore] = useState<{
    score: number;
    readinessLevel: string;
    description: string;
  } | null>(null);
  const [isCached, setIsCached] = useState<boolean>(false);
  const recommendationsRef = useRef<HTMLDivElement>(null);

  const { mutate, error, isPending } = api.assessment.create.useMutation({
    onSuccess: (response) => {
      setAiRecommendations(response.data.recommendations);
      setIsCached(response.data.cached ?? false);

      // Use the AI readiness score from the API response if available
      if (
        response.data.aiReadinessScore !== undefined &&
        response.data.aiReadinessLevel !== undefined &&
        response.data.description !== undefined
      ) {
        setReadinessScore({
          score: response.data.aiReadinessScore,
          readinessLevel: response.data.aiReadinessLevel,
          description: response.data.description,
        });
      } else {
        // Fallback to the calculated score if API doesn't provide one
        const scoreResult = calculateAiReadinessScore(form.getValues());
        setReadinessScore({
          score: scoreResult.score,
          readinessLevel: scoreResult.readinessLevel || "Not Available",
          description: scoreResult.description || "No description available",
        });
      }

      toast.success(
        response.data.cached
          ? "AI report retrieved from cache"
          : "AI report generated successfully!",
      );

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
    // Calculate AI readiness score as a fallback
    const scoreResult = calculateAiReadinessScore(data);

    // Include score in the API call
    mutate({
      ...data,
      aiReadinessScore: scoreResult.score,
      aiReadinessLevel: scoreResult.readinessLevel,
    });
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

      {readinessScore && (
        <div ref={recommendationsRef}>
          <Card className="mt-6 dark:bg-slate-900">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>AI readiness score: {readinessScore.score}/100</span>
                {isCached && (
                  <span className="text-muted-foreground text-sm font-normal">
                    (Cached result)
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Progress value={readinessScore.score} className="h-2" />
              </div>
              <div className="mb-4">
                <h3 className="text-lg font-semibold">
                  {readinessScore.readinessLevel}
                </h3>
                <p className="text-muted-foreground">
                  {readinessScore.description}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {aiRecommendations && (
        <div className={readinessScore ? "mt-4" : ""}>
          <Card className="dark:bg-slate-900">
            <CardHeader>
              <CardTitle>AI Readiness Report</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                {aiRecommendations.split("\n").map((line, index) => {
                  if (line.startsWith("# ")) {
                    return (
                      <h1 key={index} className="mt-4 text-2xl font-bold">
                        {line.substring(2)}
                      </h1>
                    );
                  } else if (line.startsWith("## ")) {
                    return (
                      <h2 key={index} className="mt-3 text-xl font-semibold">
                        {line.substring(3)}
                      </h2>
                    );
                  } else if (line.startsWith("- ")) {
                    return (
                      <li key={index} className="ml-4">
                        {line.substring(2)}
                      </li>
                    );
                  } else if (line.startsWith("**") && line.endsWith("**")) {
                    return (
                      <p key={index} className="font-bold">
                        {line.substring(2, line.length - 2)}
                      </p>
                    );
                  } else if (line.trim() === "") {
                    return <br key={index} />;
                  } else {
                    return <p key={index}>{line}</p>;
                  }
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
