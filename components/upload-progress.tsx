"use client";

import { cn } from "@/lib/utils";
import { Check, Loader2 } from "lucide-react";

interface UploadProgressProps {
  currentStep: number;
  steps: string[];
}

const stepColors = [
  "bg-primary",        // Step 1 - primary
  "bg-primary/80",     // Step 2
  "bg-primary/60",     // Step 3
  "bg-primary/40",     // Step 4
];

export function UploadProgress({ currentStep, steps }: UploadProgressProps) {
  return (
    <div className="w-full space-y-4">
      {/* Progress bar */}
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="absolute left-0 top-0 h-full bg-primary transition-all duration-500 ease-out"
          style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
        />
      </div>

      {/* Steps */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isPending = index > currentStep;

          return (
            <div
              key={index}
              className={cn(
                "flex items-start gap-3 p-3 rounded-lg border transition-all",
                isCurrent && "bg-muted/50 border-primary/50",
                isCompleted && "bg-muted/20 border-muted-foreground/20",
                isPending && "opacity-50"
              )}
            >
              <div
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-medium text-primary-foreground",
                  isCompleted ? stepColors[0] : isCurrent ? stepColors[0] : "bg-muted"
                )}
              >
                {isCompleted ? (
                  <Check className="h-3 w-3" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className={cn(
                    "text-sm font-medium",
                    isPending && "text-muted-foreground"
                  )}
                >
                  {step}
                </p>
              </div>
              {isCurrent && (
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
