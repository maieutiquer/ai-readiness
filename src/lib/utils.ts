import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { createHash } from "crypto";
import type { FormValues } from "~/app/_components/form/formDefinitions";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Generates a hash for assessment input data to use for caching
 */
export function generateAssessmentHash(data: FormValues): string {
  // Sort arrays to ensure consistent hashing regardless of order
  const normalizedData = {
    ...data,
    dataAvailability: [...data.dataAvailability].sort(),
    mainBusinessChallenge: [...data.mainBusinessChallenge].sort(),
    priorityArea: [...data.priorityArea].sort(),
  };

  // Convert to string and hash
  const inputString = JSON.stringify(normalizedData);
  return createHash("sha256").update(inputString).digest("hex");
}
