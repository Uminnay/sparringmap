import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

import { Button } from "@/components/ui/button";

export type AppView = "archive" | "drafts" | "new";

const navigationItems: Array<{ label: string; value: AppView }> = [
  { label: "Nuevo mapa", value: "new" },
  { label: "Borradores", value: "drafts" },
  { label: "Archivo", value: "archive" },
];

interface SidebarProps {
  activeView: AppView;
  archivedCount: number;
  hasActiveProject: boolean;
  isOpen: boolean;
  onNavigate: (view: AppView) => void;
  onToggle: () => void;
  projectCount: number;
}

export function Sidebar({
  activeView,
  archivedCount,
  hasActiveProject,
  isOpen,
  onNavigate,
  onToggle,
  projectCount,
}: SidebarProps) {
  if (!isOpen) {
    return (
      <aside className="hidden border-r bg-panel/95 shadow-sm lg:flex lg:min-h-screen lg:flex-col lg:items-center lg:px-2 lg:py-4">
        <Button
          aria-label="Mostrar navegacion"
          onClick={onToggle}
          size="icon"
          type="button"
          variant="ghost"
        >
          <PanelLeftOpen aria-hidden="true" data-icon="inline-start" />
        </Button>
        <div className="mt-4 grid size-9 place-items-center rounded-lg bg-primary text-xs font-bold text-primary-foreground shadow-sm">
          SM
        </div>
        {projectCount > 0 ? (
          <div className="mt-4 rounded-full bg-secondary px-2 py-1 text-xs text-muted-foreground">
            {projectCount}
          </div>
        ) : null}
      </aside>
    );
  }

  return (
    <aside className="flex flex-col border-b bg-panel/95 px-4 py-4 shadow-sm lg:min-h-screen lg:border-b-0 lg:px-5 lg:py-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid size-10 place-items-center rounded-lg bg-primary text-sm font-bold text-primary-foreground shadow-sm">
            SM
          </div>
          <div className="min-w-0">
            <p className="truncate text-base font-semibold">SparringMap</p>
            <p className="truncate text-xs text-muted-foreground">
              Mapa estrategico visual
            </p>
          </div>
        </div>
        <Button
          aria-label="Ocultar navegacion"
          className="hidden lg:inline-flex"
          onClick={onToggle}
          size="icon"
          type="button"
          variant="ghost"
        >
          <PanelLeftClose aria-hidden="true" data-icon="inline-start" />
        </Button>
      </div>

      <nav className="mt-5 grid grid-cols-3 gap-1 lg:mt-8 lg:flex lg:flex-col">
        {navigationItems.map((item) => {
          const count =
            item.value === "drafts"
              ? projectCount - archivedCount
              : item.value === "archive"
                ? archivedCount
                : 0;
          const label =
            item.value === "new" && hasActiveProject
              ? "Mapa abierto"
              : item.label;

          return (
            <button
              className="rounded-md px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground data-[active=true]:bg-secondary data-[active=true]:text-foreground"
              data-active={activeView === item.value}
              key={item.value}
              onClick={() => onNavigate(item.value)}
              type="button"
            >
              <span>{label}</span>
              {count > 0 ? (
                <span className="float-right rounded-full bg-primary/15 px-2 text-xs text-primary">
                  {count}
                </span>
              ) : null}
            </button>
          );
        })}
      </nav>

      <div className="mt-5 hidden rounded-lg border bg-background/45 p-4 lg:mt-auto lg:block">
        <p className="text-sm font-medium">Guardado local</p>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          Los proyectos se guardan en este navegador y se recuperan desde
          Borradores.
        </p>
      </div>
    </aside>
  );
}
