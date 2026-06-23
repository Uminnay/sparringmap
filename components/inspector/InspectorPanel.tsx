import { PanelRightClose, PanelRightOpen } from "lucide-react";

import type { IdeaFormValues } from "@/components/idea/IdeaForm";
import { Button } from "@/components/ui/button";
import { PROJECT_TYPE_OPTIONS } from "@/lib/constants";
import type { SparringProject } from "@/types";

interface InspectorPanelProps {
  draft: IdeaFormValues;
  isOpen: boolean;
  latestProject?: SparringProject;
  onToggle: () => void;
  storageError?: string;
}

const futureBlocks = [
  "Score de preparación",
  "Puntos débiles",
  "Riesgos críticos",
  "Próximos pasos",
] as const;

export function InspectorPanel({
  draft,
  isOpen,
  latestProject,
  onToggle,
  storageError,
}: InspectorPanelProps) {
  const selectedType = PROJECT_TYPE_OPTIONS.find(
    (option) => option.value === draft.type
  );
  const hasDraft = draft.rawInput.trim().length > 0;

  if (!isOpen) {
    return (
      <aside className="hidden border-l bg-panel/95 shadow-sm lg:flex lg:min-h-screen lg:flex-col lg:items-center lg:px-2 lg:py-4">
        <Button
          aria-label="Mostrar inspector"
          onClick={onToggle}
          size="icon"
          type="button"
          variant="ghost"
        >
          <PanelRightOpen aria-hidden="true" data-icon="inline-start" />
        </Button>
        <div className="mt-5 h-px w-8 bg-border" />
        <p className="mt-5 [writing-mode:vertical-rl] text-xs font-medium uppercase tracking-normal text-muted-foreground">
          Diagnóstico
        </p>
      </aside>
    );
  }

  return (
    <aside className="flex flex-col border-t bg-panel/95 px-4 py-4 shadow-sm lg:min-h-screen lg:border-t-0 lg:px-5 lg:py-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">Diagnóstico crítico</p>
          <p className="mt-1 text-wrap break-words text-xs leading-5 text-muted-foreground">
            Aquí aparecerá el contraste estratégico cuando entre la IA.
          </p>
        </div>
        <Button
          aria-label="Ocultar inspector"
          className="hidden lg:inline-flex"
          onClick={onToggle}
          size="icon"
          type="button"
          variant="ghost"
        >
          <PanelRightClose aria-hidden="true" data-icon="inline-start" />
        </Button>
      </div>

      <div className="mt-5 flex flex-col gap-3">
        <InspectorCard label="Tipo seleccionado" value={selectedType?.label} />
        <InspectorCard
          label="Estado"
          value={
            latestProject
              ? "Borrador guardado"
              : hasDraft
                ? "Borrador con input"
                : "Esperando idea inicial"
          }
        />
        {latestProject ? (
          <InspectorCard label="Último borrador" value={latestProject.title} />
        ) : null}
      </div>

      {storageError ? (
        <div className="mt-5 rounded-xl border border-destructive/40 bg-destructive/10 p-4">
          <p className="text-xs font-medium uppercase text-destructive">
            Error local
          </p>
          <p className="mt-2 text-xs leading-5 text-muted-foreground">
            {storageError}
          </p>
        </div>
      ) : null}

      <div className="mt-5 rounded-xl border bg-background/45 p-4">
        <p className="text-xs font-medium uppercase text-muted-foreground">
          Próximo diagnóstico
        </p>
        <div className="mt-4 flex flex-col gap-3">
          {futureBlocks.map((block) => (
            <div key={block} className="flex items-center gap-3">
              <span className="size-2 rounded-full bg-primary/60" />
              <span className="text-sm text-muted-foreground">{block}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-primary/30 bg-primary/10 p-4 lg:mt-auto">
        <p className="text-sm font-medium text-foreground">Siguiente fase</p>
        <p className="mt-2 text-xs leading-5 text-muted-foreground">
          Schemas Zod, estado local y validación estricta de respuestas.
        </p>
      </div>
    </aside>
  );
}

interface InspectorCardProps {
  label: string;
  value?: string;
}

function InspectorCard({ label, value }: InspectorCardProps) {
  return (
    <section className="rounded-xl border bg-background/45 p-4">
      <p className="text-xs font-medium uppercase text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 text-sm font-medium">{value}</p>
    </section>
  );
}
