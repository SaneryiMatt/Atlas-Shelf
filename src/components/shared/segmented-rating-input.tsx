"use client";

import { Button } from "@/components/ui/button";
import { discreteRatingValues, isDiscreteRatingValue } from "@/lib/module-list";
import { cn } from "@/lib/utils";

interface SegmentedRatingInputProps {
  id: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  ariaLabelledBy?: string;
}

function getAdjacentRating(currentValue: string, direction: 1 | -1) {
  const currentIndex = discreteRatingValues.findIndex((candidate) => candidate === currentValue);

  if (currentIndex === -1) {
    return direction === 1 ? discreteRatingValues[0] : discreteRatingValues[discreteRatingValues.length - 1];
  }

  return discreteRatingValues[Math.min(discreteRatingValues.length - 1, Math.max(0, currentIndex + direction))];
}

export function SegmentedRatingInput({
  id,
  name,
  value,
  onChange,
  disabled = false,
  ariaLabelledBy
}: SegmentedRatingInputProps) {
  const resolvedValue = isDiscreteRatingValue(value) ? value : "";

  return (
    <div className="space-y-2">
      <input id={id} type="hidden" name={name} value={resolvedValue} />
      <div className="flex items-center gap-3">
        <div
          role="radiogroup"
          aria-labelledby={ariaLabelledBy}
          className="grid flex-1 grid-cols-5 gap-1.5 rounded-2xl border border-white/10 bg-white/[0.04] p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur"
          onKeyDown={(event) => {
            if (disabled) {
              return;
            }

            let nextValue: string | null = null;

            if (event.key === "ArrowRight" || event.key === "ArrowDown") {
              nextValue = getAdjacentRating(resolvedValue, 1);
            } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
              nextValue = getAdjacentRating(resolvedValue, -1);
            } else if (event.key === "Home") {
              nextValue = discreteRatingValues[0];
            } else if (event.key === "End") {
              nextValue = discreteRatingValues[discreteRatingValues.length - 1];
            } else if ((event.key === "Backspace" || event.key === "Delete") && resolvedValue) {
              nextValue = "";
            }

            if (nextValue === null) {
              return;
            }

            event.preventDefault();
            onChange(nextValue);

            if (!nextValue) {
              return;
            }

            window.requestAnimationFrame(() => {
              const nextButton = event.currentTarget.querySelector<HTMLButtonElement>(`[data-rating-value="${nextValue}"]`);
              nextButton?.focus();
            });
          }}
        >
          {discreteRatingValues.map((option, index) => {
            const selected = option === resolvedValue;

            return (
              <Button
                key={option}
                type="button"
                variant="ghost"
                size="sm"
                role="radio"
                data-rating-value={option}
                aria-checked={selected}
                aria-label={`${option} 分`}
                tabIndex={selected || (!resolvedValue && index === 0) ? 0 : -1}
                disabled={disabled}
                onClick={() => onChange(option)}
                className={cn(
                  "h-10 rounded-xl border border-transparent bg-transparent text-sm font-semibold text-muted-foreground/80 transition-all duration-200 hover:border-white/10 hover:bg-white/[0.08] hover:text-foreground",
                  selected && "border-amber-200/30 bg-amber-200/10 text-amber-50 shadow-[0_12px_30px_rgba(217,145,48,0.18)]"
                )}
              >
                {option}
              </Button>
            );
          })}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={disabled || !resolvedValue}
          onClick={() => onChange("")}
          className="shrink-0 rounded-xl border border-border/40 bg-background/30 px-3 text-xs text-muted-foreground transition-colors hover:bg-background/60 hover:text-foreground"
        >
          清空
        </Button>
      </div>
    </div>
  );
}
