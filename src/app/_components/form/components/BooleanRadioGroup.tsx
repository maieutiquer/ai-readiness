"use client";

import type { Control } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormDescription,
  FormMessage,
} from "~/components/ui/form";
import { Switch } from "~/components/ui/switch";
import type { FormValues } from "../types";

interface BooleanRadioGroupProps {
  control: Control<FormValues>;
  name: keyof FormValues;
  label: string;
  description?: string;
  className?: string;
}

export function BooleanRadioGroup({
  control,
  name,
  label,
  description,
}: BooleanRadioGroupProps) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-col justify-between gap-1">
          <div>
            <FormLabel className="text-base">{label}</FormLabel>
            {description && <FormDescription>{description}</FormDescription>}
          </div>
          <FormControl>
            <Switch
              checked={Boolean(field.value)}
              onCheckedChange={field.onChange}
            />
          </FormControl>
          <FormDescription>{field.value ? "Yes" : "No"}</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
