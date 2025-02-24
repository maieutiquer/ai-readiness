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
type ArrayFields<T> = {
  [K in keyof T]: T[K] extends readonly unknown[] ? K : never;
}[keyof T];

interface CheckboxGroupProps<TFieldName extends ArrayFields<FormValues>> {
  control: Control<FormValues>;
  name: TFieldName;
  label: string;
  // The options should be compatible with the array element type
  options: readonly string[];
}

export function CheckboxGroup<TFieldName extends ArrayFields<FormValues>>({
  control,
  name,
  label,
  options,
}: CheckboxGroupProps<TFieldName>) {
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
                    className="flex flex-row items-start space-x-3 space-y-0"
                  >
                    <FormControl>
                      <Checkbox
                        checked={value?.includes(option)}
                        onCheckedChange={(checked) => {
                          // Ensure field.value is an array before spreading
                          const currentValue = Array.isArray(field.value)
                            ? field.value
                            : [];

                          // Use type assertion to unknown first, then to the array type
                          // This avoids the direct use of 'any'
                          const typedOption =
                            option as unknown as FormValues[TFieldName][number];

                          return checked
                            ? field.onChange([...currentValue, typedOption])
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
