"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { AssessmentForm } from "./_components/AssessmentForm";
import { ModeToggle } from "./_components/ModeToggle";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background bg-gradient-to-b text-foreground">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
        <ModeToggle />
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
          <span className="text-[hsl(280,100%,70%)]">AI</span> Readiness
          Assessment Tool
        </h1>
        <Card className="mx-auto max-w-lg bg-background text-foreground">
          <CardHeader>
            <CardTitle>
              Please answer the following questions to help us understand your
              organization&apos;s AI readiness.
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AssessmentForm />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
