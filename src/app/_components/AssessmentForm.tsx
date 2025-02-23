"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { createTRPCReact } from "@trpc/react-query";
import { type AppRouter } from "~/server/api/root";
import type { inferRouterOutputs } from "@trpc/server";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { Label } from "~/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "~/components/ui/form";
const api = createTRPCReact<AppRouter>();

type RouterOutput = inferRouterOutputs<AppRouter>;
type AssessmentResponse = RouterOutput["assessment"]["create"];

// Define form schema
const formSchema = z.object({
  company_size: z.enum(["Small (1-50)", "Medium (51-500)", "Large (500+)"]),
  industry: z.enum(["Finance", "Healthcare", "Retail", "Technology", "Other"]),
  tech_maturity: z.number().min(1).max(5),
  data_availability: z.enum([
    "None",
    "Limited",
    "Structured",
    "Structured & Unstructured",
  ]),
  budget: z.enum(["< $50k", "$50k - $100k", "$100k - $500k", "$500k+"]),
  timeline: z.enum(["< 3 months", "3-6 months", "6-12 months", "12+ months"]),
  expertise_level: z.number().min(1).max(5),
  ai_experience: z.boolean(),
  priority_area: z.enum([
    "Customer Service",
    "Process Automation",
    "Decision Support",
    "Other",
  ]),
});

type FormValues = z.infer<typeof formSchema>;

export function AssessmentForm() {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = form;

  const [aiRecommendations, setAiRecommendations] = useState<string | null>(
    null,
  );

  // Handle form submission
  // const mutation = api.assessment.create.useMutation({
  //   onSuccess: (response: { data: { recommendations: string } }) => {
  //     setAiRecommendations(response.data.recommendations);
  //   },
  //   onError: (error: Error) => {
  //     console.error("Error submitting form:", error);
  //   },
  // });

  const onSubmit = (data: FormValues) => {
    // mutation.mutate(data);
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={control}
            name="company_size"
            render={({ field }) => (
              <>
                <div className="space-y-2">
                  <Label htmlFor="company_size">Company Size</Label>
                  <Select
                    onValueChange={(value: FormValues["company_size"]) =>
                      register("company_size").onChange({ target: { value } })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select company size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Small (1-50)">Small (1-50)</SelectItem>
                      <SelectItem value="Medium (51-500)">
                        Medium (51-500)
                      </SelectItem>
                      <SelectItem value="Large (500+)">Large (500+)</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.company_size && (
                    <p className="text-red-500">Required</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tech_maturity">Tech Maturity (1-5)</Label>
                  <Input
                    type="number"
                    {...register("tech_maturity")}
                    min="1"
                    max="5"
                  />
                  {errors.tech_maturity && (
                    <p className="text-red-500">Must be between 1-5</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>AI Experience</Label>
                  <RadioGroup
                    onValueChange={(value: string) =>
                      register("ai_experience").onChange({
                        target: { value: value === "true" },
                      })
                    }
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="true" id="ai-yes" />
                      <Label htmlFor="ai-yes">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="false" id="ai-no" />
                      <Label htmlFor="ai-no">No</Label>
                    </div>
                  </RadioGroup>
                  {errors.ai_experience && (
                    <p className="text-red-500">Required</p>
                  )}
                </div>

                <Button type="submit" className="w-full">
                  Submit
                </Button>
              </>
            )}
          />
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
