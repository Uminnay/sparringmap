import { Moon, Sun } from "lucide-react";

import { WorkflowStepper } from "@/components/app-shell/WorkflowStepper";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ProjectType, WorkflowStage } from "@/types";

const projectTypeLabel: Record<ProjectType, string> = {
  app_product: "App / producto",
  business_strategy: "Estrategia de negocio",
};

interface TopBarProps {
  activeStage: WorkflowStage;
  availableStage: WorkflowStage;
  libraryTitle?: string;
  onStageChange: (stage: WorkflowStage) => void;
  onToggleTheme: () => void;
  projectTitle?: string;
  projectType: ProjectType;
  showWorkflow: boolean;
  theme: "dark" | "light";
}

export function TopBar({
  activeStage,
  availableStage,
  libraryTitle,
  onStageChange,
  onToggleTheme,
  projectTitle,
  projectType,
  showWorkflow,
  theme,
}: TopBarProps) {
  const displayTitle =
    libraryTitle ?? (projectTitle || "Nuevo mapa estrategico");
  const isMapStage = showWorkflow && activeStage === "map";
  const projectStateLabel = projectTitle
    ? isMapStage
      ? "Mapa guardado local"
      : "Guardado local"
    : "Borrador";

  return (
    <header
      className={cn(
        "sticky top-0 z-20 border-b bg-[var(--panel-glass)] px-3 backdrop-blur-xl md:px-5",
        isMapStage ? "py-2" : "py-3"
      )}
    >
      <div className="flex min-h-9 items-center justify-between gap-3">
        <div className="min-w-0">
          <h1
            className={cn(
              "truncate font-semibold",
              isMapStage ? "text-sm md:text-base" : "text-base md:text-lg"
            )}
          >
            {displayTitle}
          </h1>
          <p className="truncate text-xs text-muted-foreground">
            {libraryTitle
              ? "Proyectos guardados en este navegador"
              : projectTypeLabel[projectType]}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button
            aria-label={
              theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"
            }
            onClick={onToggleTheme}
            size="icon"
            type="button"
            variant="outline"
          >
            {theme === "dark" ? (
              <Sun aria-hidden="true" data-icon="inline-start" />
            ) : (
              <Moon aria-hidden="true" data-icon="inline-start" />
            )}
          </Button>
          {showWorkflow ? (
            <div className="hidden rounded-md border bg-card px-3 py-1.5 text-xs text-muted-foreground shadow-sm sm:block">
              {projectStateLabel}
            </div>
          ) : null}
        </div>
      </div>

      {showWorkflow ? (
        <div className={cn(isMapStage ? "mt-2" : "mt-3")}>
          <WorkflowStepper
            activeStage={activeStage}
            availableStage={availableStage}
            compact={isMapStage}
            onStageChange={onStageChange}
          />
        </div>
      ) : null}
    </header>
  );
}
