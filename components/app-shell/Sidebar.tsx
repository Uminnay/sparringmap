import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

import { Button } from "@/components/ui/button";

const navigationItems = ["Nuevo mapa", "Borradores", "Archivo"] as const;

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  if (!isOpen) {
    return (
      <aside className="hidden border-r bg-panel/95 shadow-sm lg:flex lg:min-h-screen lg:flex-col lg:items-center lg:px-2 lg:py-4">
        <Button
          aria-label="Mostrar navegación"
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
              Mapa estratégico visual
            </p>
          </div>
        </div>
        <Button
          aria-label="Ocultar navegación"
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
        {navigationItems.map((item) => (
          <button
            key={item}
            className="rounded-md px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground data-[active=true]:bg-secondary data-[active=true]:text-foreground"
            data-active={item === "Nuevo mapa"}
            type="button"
          >
            {item}
          </button>
        ))}
      </nav>

      <div className="mt-5 hidden rounded-lg border bg-background/45 p-4 lg:mt-auto lg:block">
        <p className="text-sm font-medium">Fase 1</p>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          Scaffold y UI base. El análisis crítico entra en la siguiente fase.
        </p>
      </div>
    </aside>
  );
}
