import { Check } from "lucide-react";

import { cn } from "@/lib/utils";
import type { WorkflowStage } from "@/types";

const stages: Array<{ label: string; value: WorkflowStage }> = [
  { label: "Idea", value: "idea" },
  { label: "Preguntas", value: "questions" },
  { label: "Mapa", value: "map" },
];

const stageRank: Record<WorkflowStage, number> = {
  idea: 0,
  questions: 1,
  map: 2,
};

interface WorkflowStepperProps {
  activeStage: WorkflowStage;
  availableStage: WorkflowStage;
  onStageChange: (stage: WorkflowStage) => void;
}

export function WorkflowStepper({
  activeStage,
  availableStage,
  onStageChange,
}: WorkflowStepperProps) {
  const availableRank = stageRank[availableStage];

  return (
    <nav
      aria-label="Etapas del mapa"
      className="grid w-full grid-cols-3 gap-1 rounded-lg border bg-background/55 p-1"
    >
      {stages.map((stage, index) => {
        const isActive = stage.value === activeStage;
        const isCompleted =
          stageRank[stage.value] < availableRank && !isActive;
        const isAvailable = stageRank[stage.value] <= availableRank;

        return (
          <button
            aria-current={isActive ? "step" : undefined}
            className={cn(
              "flex min-h-10 min-w-0 items-center justify-center gap-1.5 rounded-md px-2 text-xs font-medium transition-colors",
              "disabled:cursor-not-allowed disabled:opacity-40",
              isActive
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
            disabled={!isAvailable}
            key={stage.value}
            onClick={() => onStageChange(stage.value)}
            type="button"
          >
            <span className="grid size-5 shrink-0 place-items-center rounded-full border border-current text-[11px]">
              {isCompleted && !isActive ? (
                <Check aria-hidden="true" />
              ) : (
                index + 1
              )}
            </span>
            <span className="truncate">{stage.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
