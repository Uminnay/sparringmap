import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { ProjectType } from "@/types";

const projectTypeLabel: Record<ProjectType, string> = {
  app_product: "App / producto",
  business_strategy: "Estrategia de negocio",
};

interface TopBarProps {
  onToggleTheme: () => void;
  projectType: ProjectType;
  theme: "dark" | "light";
}

export function TopBar({ onToggleTheme, projectType, theme }: TopBarProps) {
  return (
    <header className="sticky top-0 flex min-h-16 items-center justify-between gap-3 border-b bg-[var(--panel-glass)] px-3 backdrop-blur-xl md:px-5">
      <div className="min-w-0">
        <h1 className="truncate text-base font-semibold md:text-lg">
          Nuevo mapa estratégico
        </h1>
        <p className="truncate text-xs text-muted-foreground">
          {projectTypeLabel[projectType]}
        </p>
      </div>
      <div className="flex items-center gap-2">
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
        <div className="rounded-md border bg-card px-3 py-1.5 text-xs text-muted-foreground shadow-sm">
          Borrador
        </div>
      </div>
    </header>
  );
}
