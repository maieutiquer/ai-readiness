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

// Define form schema
export const formSchema = z.object({
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
    defaultValues: {
      company_size: "Small (1-50)",
      industry: "Technology",
      tech_maturity: 1,
      data_availability: "None",
      budget: "< $50k",
      timeline: "< 3 months",
      expertise_level: 1,
      ai_experience: false,
      priority_area: "Customer Service",
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
          <FormField
            control={form.control}
            name="company_size"
            render={({ field }) => (
              <>
                <FormItem>
                  <FormLabel>Company Size</FormLabel>
                  <Select onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select company size" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Small (1-50)">Small (1-50)</SelectItem>
                      <SelectItem value="Medium (51-500)">
                        Medium (51-500)
                      </SelectItem>
                      <SelectItem value="Large (500+)">Large (500+)</SelectItem>
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
                          <SelectItem value="Finance">Finance</SelectItem>
                          <SelectItem value="Healthcare">Healthcare</SelectItem>
                          <SelectItem value="Retail">Retail</SelectItem>
                          <SelectItem value="Technology">Technology</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tech_maturity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Technology Maturity</FormLabel>
                      <Select onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select technology maturity" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1">1</SelectItem>
                          <SelectItem value="2">2</SelectItem>
                          <SelectItem value="3">3</SelectItem>
                          <SelectItem value="4">4</SelectItem>
                          <SelectItem value="5">5</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="data_availability"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data Availability</FormLabel>
                      <Select onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select data availability" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="None">None</SelectItem>
                          <SelectItem value="Limited">Limited</SelectItem>
                          <SelectItem value="Structured">Structured</SelectItem>
                          <SelectItem value="Structured & Unstructured">
                            Structured & Unstructured
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="budget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Budget</FormLabel>
                      <Select onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select budget" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="< $50k">$50k</SelectItem>
                          <SelectItem value="$50k - $100k">
                            $50k - $100k
                          </SelectItem>
                          <SelectItem value="$100k - $500k">
                            $100k - $500k
                          </SelectItem>
                          <SelectItem value="$500k+">$500k+</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="timeline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Timeline</FormLabel>
                      <Select onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select timeline" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="< 3 months">
                            &lt; 3 months
                          </SelectItem>
                          <SelectItem value="3-6 months">3-6 months</SelectItem>
                          <SelectItem value="6-12 months">
                            6-12 months
                          </SelectItem>
                          <SelectItem value="12+ months">12+ months</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="expertise_level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expertise Level</FormLabel>
                      <Select onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select expertise level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1">1</SelectItem>
                          <SelectItem value="2">2</SelectItem>
                          <SelectItem value="3">3</SelectItem>
                          <SelectItem value="4">4</SelectItem>
                          <SelectItem value="5">5</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ai_experience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>AI Experience</FormLabel>
                      <Select onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select AI experience" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="true">Yes</SelectItem>
                          <SelectItem value="false">No</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="priority_area"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority Area</FormLabel>
                      <Select onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority area" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Customer Service">
                            Customer Service
                          </SelectItem>
                          <SelectItem value="Process Automation">
                            Process Automation
                          </SelectItem>
                          <SelectItem value="Decision Support">
                            Decision Support
                          </SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
          />

          <div className="flex justify-between">
            <Button type="submit" disabled={isPending}>
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
