import { Moon, Sun } from "lucide-react";

import { WorkflowStepper } from "@/components/app-shell/WorkflowStepper";
import { Button } from "@/components/ui/button";
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
    libraryTitle ?? (projectTitle || "Nuevo mapa estratégico");

  return (
    <header className="sticky top-0 z-20 border-b bg-[var(--panel-glass)] px-3 py-3 backdrop-blur-xl md:px-5">
      <div className="flex min-h-10 items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="truncate text-base font-semibold md:text-lg">
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
              {projectTitle ? "Guardado local" : "Borrador"}
            </div>
          ) : null}
        </div>
      </div>

      {showWorkflow ? (
        <div className="mt-3">
          <WorkflowStepper
            activeStage={activeStage}
            availableStage={availableStage}
            onStageChange={onStageChange}
          />
        </div>
      ) : null}
    </header>
  );
}
