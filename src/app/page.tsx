"use client";

import { useEffect, useState } from "react";
import { AssessmentForm } from "./_components/form/AssessmentForm";
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
    <main className="flex flex-col items-center gap-20 p-10">
      <ModeToggle />
      <h1 className="text-7xl">
        <span className="animate-gradient-pulse bg-gradient-to-r from-blue-600 via-blue-400 to-red-500 bg-clip-text font-extrabold text-transparent drop-shadow-[0_0_30px_rgba(192,38,211,0.5)]">
          AI
        </span>{" "}
        Readiness Assessment Tool
      </h1>
      <AssessmentForm />
    </main>
  );
}
