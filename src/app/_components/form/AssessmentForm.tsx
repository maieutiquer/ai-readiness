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
import { Input } from "~/components/ui/input";
import type { FollowUpQuestionWithAgent } from "~/lib/ai/aiOrchestrator";
import { ChevronDown, ChevronUp } from "lucide-react";

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
  const [followUpQuestions, setFollowUpQuestions] = useState<
    FollowUpQuestionWithAgent[]
  >([]);
  const [followUpAnswers, setFollowUpAnswers] = useState<
    Record<string, string>
  >({});
  const [answeredQuestions, setAnsweredQuestions] = useState<
    Record<string, { answer: string; question: string; context?: string }>
  >({});
  const [showOptionalFields, setShowOptionalFields] = useState<boolean>(false);
  const initialSubmitRef = useRef<HTMLDivElement>(null);

  // Reset state when form is submitted
  const resetState = () => {
    setFollowUpQuestions([]);
    setFollowUpAnswers({});
    setAnsweredQuestions({});
  };

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

      // Store any follow-up questions
      if (response.data.followUpQuestions) {
        setFollowUpQuestions(response.data.followUpQuestions);
      } else {
        setFollowUpQuestions([]);
      }

      toast.success(
        response.data.cached
          ? "AI report retrieved from cache"
          : "AI report generated successfully!",
      );

      setTimeout(() => {
        if (initialSubmitRef.current) {
          initialSubmitRef.current.scrollIntoView({ behavior: "smooth" });
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

  // Add a new mutation for handling follow-up question answers
  const { mutate: submitFollowUpAnswer, isPending: isSubmittingAnswer } =
    api.assessment.answerFollowUp.useMutation({
      onSuccess: (response) => {
        setAiRecommendations(response.data.recommendations);

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
        }

        // Update follow-up questions
        if (response.data.followUpQuestions) {
          setFollowUpQuestions(response.data.followUpQuestions);
        } else {
          setFollowUpQuestions([]);
        }

        // Save all answered questions
        const updatedAnsweredQuestions = { ...answeredQuestions };

        // Process all the answers that were submitted
        Object.keys(followUpAnswers).forEach((questionId) => {
          const answer = followUpAnswers[questionId];
          if (answer && answer.trim() !== "") {
            const questionData = followUpQuestions.find(
              (q) => q.id === questionId,
            );
            if (questionData) {
              updatedAnsweredQuestions[questionId] = {
                answer: answer,
                question: questionData.question,
                context: questionData.context,
              };
            }
          }
        });

        setAnsweredQuestions(updatedAnsweredQuestions);

        // Clear the input answers
        setFollowUpAnswers({});

        toast.success("Answers processed successfully!");

        setTimeout(() => {
          if (initialSubmitRef.current) {
            initialSubmitRef.current.scrollIntoView({ behavior: "smooth" });
          }
        }, 150);
      },
      onError: (error) => {
        console.error("Error processing follow-up answer:", error);
        toast.error("Error processing your answers", {
          description:
            error.message || "Please try again with different answers.",
          duration: 5000,
        });
      },
    });

  const onSubmit = (data: FormValues) => {
    // Reset state
    resetState();

    // Calculate AI readiness score as a fallback
    const scoreResult = calculateAiReadinessScore(data);

    // Include score in the API call
    mutate({
      ...data,
      aiReadinessScore: scoreResult.score,
      aiReadinessLevel: scoreResult.readinessLevel,
    });
  };

  const handleFollowUpAnswerChange = (questionId: string, value: string) => {
    setFollowUpAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Required fields */}
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

          {/* Optional fields toggle */}
          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowOptionalFields(!showOptionalFields)}
              className="flex w-full justify-between"
            >
              <span>
                {showOptionalFields
                  ? "Hide optional fields"
                  : "Show optional fields"}
              </span>
              {showOptionalFields ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Optional fields */}
          {showOptionalFields && (
            <div className="space-y-6 rounded-md border p-4">
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
            </div>
          )}

          <div ref={initialSubmitRef} className="flex justify-between">
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

      {followUpQuestions.length > 0 && (
        <div className="mt-6">
          <Card className="dark:bg-slate-900">
            <CardHeader>
              <CardTitle>Follow-up Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {followUpQuestions.map((question) => (
                  <div key={question.id} className="space-y-2">
                    <div className="flex flex-col space-y-1">
                      <h3 className="font-medium">{question.question}</h3>
                      <p className="text-muted-foreground text-sm">
                        {question.context}
                      </p>
                    </div>
                    <Input
                      value={followUpAnswers[question.id] || ""}
                      onChange={(e) =>
                        handleFollowUpAnswerChange(question.id, e.target.value)
                      }
                      placeholder="Your answer..."
                      className="flex-1"
                    />
                  </div>
                ))}
                <Button
                  onClick={() => {
                    // Get all answered questions
                    const validAnswerIds = Object.keys(followUpAnswers).filter(
                      (id) => followUpAnswers[id]?.trim() !== "",
                    );

                    if (validAnswerIds.length > 0) {
                      // Create an object with all answers
                      const allAnswers = validAnswerIds.reduce(
                        (acc, questionId) => {
                          if (followUpAnswers[questionId]) {
                            acc[questionId] = followUpAnswers[questionId];
                          }
                          return acc;
                        },
                        {} as Record<string, string>,
                      );

                      // Submit all answers at once
                      submitFollowUpAnswer({
                        formData: form.getValues(),
                        answers: allAnswers,
                      });
                    } else {
                      toast.error(
                        "Please provide at least one answer before submitting.",
                      );
                    }
                  }}
                  disabled={
                    isSubmittingAnswer ||
                    !followUpQuestions.length ||
                    Object.keys(followUpAnswers).every(
                      (id) =>
                        !followUpAnswers[id] ||
                        followUpAnswers[id].trim() === "",
                    )
                  }
                  className="mt-4 w-full"
                >
                  {isSubmittingAnswer ? "Processing..." : "Submit Answers"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Show answered questions if there are any */}
      {Object.keys(answeredQuestions).length > 0 &&
        followUpQuestions.length === 0 && (
          <div className="mt-6">
            <Card className="dark:bg-slate-900">
              <CardHeader>
                <CardTitle>Your Answers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(answeredQuestions).map(
                    ([questionId, { answer, question, context }]) => {
                      return (
                        <div
                          key={questionId}
                          className="rounded-md border border-blue-200 p-4 dark:border-blue-800"
                        >
                          <div className="mb-2 font-medium text-blue-600 dark:text-blue-400">
                            {question}
                          </div>
                          <div className="text-muted-foreground text-sm">
                            <span className="font-medium">Your answer:</span>{" "}
                            {answer}
                          </div>
                          {context && (
                            <div className="text-muted-foreground text-sm">
                              <span className="font-medium">Context:</span>{" "}
                              {context}
                            </div>
                          )}
                        </div>
                      );
                    },
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

      {readinessScore && (
        <div>
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
                    if (line.includes("INSIGHTS FROM FOLLOW-UP QUESTIONS")) {
                      return (
                        <h2
                          key={index}
                          className="mt-3 rounded-md bg-blue-100 p-2 text-xl font-semibold dark:bg-blue-900"
                        >
                          {line.substring(3)}
                        </h2>
                      );
                    }
                    return (
                      <h2 key={index} className="mt-3 text-xl font-semibold">
                        {line.substring(3)}
                      </h2>
                    );
                  } else if (line.startsWith("- ")) {
                    if (
                      line.toLowerCase().includes("follow-up") ||
                      line.toLowerCase().includes("you answered") ||
                      line.toLowerCase().includes("your answer")
                    ) {
                      return (
                        <li
                          key={index}
                          className="ml-4 font-medium text-blue-600 dark:text-blue-400"
                        >
                          {line.substring(2)}
                        </li>
                      );
                    }
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
                    if (
                      line.toLowerCase().includes("follow-up") ||
                      line.toLowerCase().includes("you answered") ||
                      line.toLowerCase().includes("your answer")
                    ) {
                      return (
                        <p
                          key={index}
                          className="font-medium text-blue-600 dark:text-blue-400"
                        >
                          {line}
                        </p>
                      );
                    }
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
