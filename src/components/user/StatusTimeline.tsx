import { formatDate } from "@/lib/utils";
import { Check } from "lucide-react";

export interface TimelineStep {
  label: string;
  completed: boolean;
  date?: string;
}

interface StatusTimelineProps {
  steps: TimelineStep[];
}

const StatusTimeline = ({ steps }: StatusTimelineProps) => {
  return (
    <div className="space-y-0">
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;

        return (
          <div key={step.label} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div
                className={[
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
                  step.completed
                    ? "bg-primary-600"
                    : "border-2 border-neutral-300 bg-white",
                ].join(" ")}
              >
                {step.completed && (
                  <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
                )}
              </div>
              {!isLast && (
                <div
                  className={[
                    "my-1 w-0.5 flex-1 min-h-6",
                    step.completed ? "bg-primary-600" : "bg-neutral-200",
                  ].join(" ")}
                />
              )}
            </div>
            <div className={isLast ? "pb-0" : "pb-5"}>
              <p
                className={[
                  "text-sm",
                  step.completed
                    ? "font-medium text-neutral-900"
                    : "text-neutral-500",
                ].join(" ")}
              >
                {step.label}
              </p>
              <p className="mt-0.5 text-xs text-neutral-500">
                {step.date ? formatDate(step.date) : "—"}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatusTimeline;
