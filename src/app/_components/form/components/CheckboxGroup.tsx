"use client";

import type { Control } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Checkbox } from "~/components/ui/checkbox";
import type { FormValues } from "../formDefinitions";

// Type utility to extract array field names from FormValues
type ArrayFieldsOf<T> = {
  [K in keyof T]: T[K] extends readonly unknown[] ? K : never;
}[keyof T] &
  keyof T;

// Type for array field names in FormValues
type FormArrayField = ArrayFieldsOf<FormValues>;

interface CheckboxGroupProps {
  control: Control<FormValues>;
  name: FormArrayField;
  label: string;
  options: readonly string[];
}

export function CheckboxGroup({
  control,
  name,
  label,
  options,
}: CheckboxGroupProps) {
  return (
    <FormField
      control={control}
      name={name}
      render={() => (
        <FormItem>
          <div className="mb-4">
            <FormLabel className="text-base">{label}</FormLabel>
          </div>
          {options.map((option) => (
            <FormField
              key={option}
              control={control}
              name={name}
              render={({ field }) => {
                // Since we've constrained name to array fields, field.value must be an array
                // But we need to help TypeScript understand this
                const value = field.value as unknown as string[];

                return (
                  <FormItem
                    key={option}
                    className="flex flex-row items-start space-y-0 space-x-3"
                  >
                    <FormControl>
                      <Checkbox
                        checked={value?.includes(option)}
                        onCheckedChange={(checked) => {
                          // Ensure field.value is an array before spreading
                          const currentValue = Array.isArray(field.value)
                            ? field.value
                            : [];

                          return checked
                            ? field.onChange([...currentValue, option])
                            : field.onChange(
                                currentValue.filter(
                                  (value) => value !== option,
                                ),
                              );
                        }}
                      />
                    </FormControl>
                    <FormLabel className="font-normal">{option}</FormLabel>
                  </FormItem>
                );
              }}
            />
          ))}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
