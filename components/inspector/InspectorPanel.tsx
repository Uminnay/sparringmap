"use client";

import { useState, type ReactNode } from "react";
import {
  Ban,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Circle,
  PanelRightClose,
  PanelRightOpen,
  XCircle,
} from "lucide-react";

import type { IdeaFormValues } from "@/components/idea/IdeaForm";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AI_MODEL_OPTIONS, PROJECT_TYPE_OPTIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type {
  MapNodeSelection,
  NodeReviewStatus,
  SparringProject,
  UIStatus,
  WorkflowStage,
} from "@/types";

export interface AIErrorState {
  issues?: string[];
  message: string;
  rawResponse?: string;
}

interface InspectorPanelProps {
  aiError?: AIErrorState;
  draft: IdeaFormValues;
  isOpen: boolean;
  latestProject?: SparringProject;
  onNodeStatusChange: (nodeId: string, status: NodeReviewStatus) => void;
  onRefinementNoteChange: (value: string) => void;
  onRequestRefinementQuestions: () => void;
  onToggle: () => void;
  refinementNote: string;
  refinementQuestions: string[];
  selectedNode?: MapNodeSelection;
  storageError?: string;
  uiStatus: UIStatus;
  workflowStage: WorkflowStage;
}

export function InspectorPanel({
  aiError,
  draft,
  isOpen,
  latestProject,
  onNodeStatusChange,
  onRefinementNoteChange,
  onRequestRefinementQuestions,
  onToggle,
  refinementNote,
  refinementQuestions,
  selectedNode,
  storageError,
  uiStatus,
  workflowStage,
}: InspectorPanelProps) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    diagnostic: true,
    node: true,
    questions: false,
    refine: false,
    status: false,
    verdict: true,
  });
  const selectedType = PROJECT_TYPE_OPTIONS.find(
    (option) => option.value === draft.type
  );
  const selectedModel = AI_MODEL_OPTIONS.find(
    (option) => option.value === draft.aiModelId
  );
  const projectModel = AI_MODEL_OPTIONS.find(
    (option) => option.value === latestProject?.aiModelId
  );
  const diagnostic = latestProject?.structuredResponse?.diagnostic;
  const generationMetrics = latestProject?.latestGenerationMetrics;
  const isBusy = uiStatus === "analyzing" || uiStatus === "generating";
  const verdict = latestProject?.structuredResponse
    ? buildVerdict(latestProject)
    : undefined;

  function toggleSection(id: string) {
    setOpenSections((current) => ({ ...current, [id]: !current[id] }));
  }

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
          Decisión
        </p>
      </aside>
    );
  }

  return (
    <aside className="flex max-h-none flex-col border-t bg-panel/95 px-4 py-4 shadow-sm lg:sticky lg:top-0 lg:h-screen lg:self-start lg:overflow-y-auto lg:border-t-0 lg:px-5 lg:py-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">Panel de decisión</p>
          <p className="mt-1 text-wrap break-words text-xs leading-5 text-muted-foreground">
            Nodo, veredicto y diagnóstico accionable.
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

      <CollapsibleSection
        id="status"
        isOpen={openSections.status}
        onToggle={toggleSection}
        title="Estado"
      >
        <div className="grid gap-3">
          <InspectorCard
            label="Flujo"
            value={getStatusLabel(uiStatus, workflowStage)}
          />
          <InspectorCard label="Tipo" value={selectedType?.label} />
          <InspectorCard
            label="Modelo"
            value={projectModel?.label ?? selectedModel?.label}
          />
          {latestProject?.readinessScore !== undefined ? (
            <InspectorCard
              label="Readiness"
              value={`${latestProject.readinessScore}/100`}
            />
          ) : null}
          {generationMetrics ? (
            <section className="rounded-xl border bg-background/45 p-4">
              <p className="text-xs font-medium uppercase text-muted-foreground">
                Última generación
              </p>
              <dl className="mt-2 grid gap-1 text-xs leading-5 text-muted-foreground">
                <MetricRow
                  label="Tiempo"
                  value={`${(generationMetrics.latencyMs / 1000).toFixed(1)} s`}
                />
                <MetricRow
                  label="Tokens"
                  value={`${generationMetrics.estimatedInputTokens} / ${generationMetrics.estimatedOutputTokens}`}
                />
                <MetricRow
                  label="Coste"
                  value={generationMetrics.estimatedCostLabel}
                />
              </dl>
            </section>
          ) : null}
        </div>
      </CollapsibleSection>

      {storageError ? (
        <ErrorBlock title="Error local" message={storageError} />
      ) : null}

      {aiError ? <AIErrorBlock error={aiError} /> : null}

      {selectedNode ? (
        <CollapsibleSection
          id="node"
          isOpen={openSections.node}
          onToggle={toggleSection}
          title="Nodo seleccionado"
        >
          <section className="rounded-xl border border-primary/35 bg-primary/10 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-foreground">
                {selectedNode.label}
              </p>
              {selectedNode.priority ? (
                <span className="rounded-md border bg-background/55 px-2 py-0.5 text-[11px] font-medium uppercase text-muted-foreground">
                  {priorityLabel[selectedNode.priority]}
                </span>
              ) : null}
            </div>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {selectedNode.description}
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {nodeStatusOptions.map((option) => {
                const isActive =
                  (selectedNode.reviewStatus ?? "pending") === option.value;

                return (
                  <Button
                    className={cn(
                      "justify-start",
                      isActive && option.activeClass
                    )}
                    key={option.value}
                    onClick={() =>
                      onNodeStatusChange(selectedNode.id, option.value)
                    }
                    size="sm"
                    type="button"
                    variant={isActive ? "secondary" : "outline"}
                  >
                    <option.icon aria-hidden="true" data-icon="inline-start" />
                    {option.label}
                  </Button>
                );
              })}
            </div>
          </section>
        </CollapsibleSection>
      ) : latestProject?.structuredResponse ? (
        <section className="mt-5 rounded-xl border bg-background/45 p-4">
          <p className="text-sm font-medium">Sin nodo seleccionado</p>
          <p className="mt-2 text-xs leading-5 text-muted-foreground">
            Clica cualquier bloque del mapa para marcarlo o leerlo completo.
          </p>
        </section>
      ) : null}

      {verdict ? (
        <CollapsibleSection
          id="verdict"
          isOpen={openSections.verdict}
          onToggle={toggleSection}
          title="Veredicto"
        >
          <section
            className={cn(
              "rounded-xl border p-4",
              verdict.tone === "risk" && "border-risk/35 bg-risk/10",
              verdict.tone === "warning" &&
                "border-hypothesis/35 bg-hypothesis/10",
              verdict.tone === "positive" && "border-action/35 bg-action/10"
            )}
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md border bg-background/70 px-2 py-1 text-[11px] font-semibold uppercase text-muted-foreground">
                {verdict.statusLabel}
              </span>
              <p className="text-sm font-semibold text-foreground">
                {verdict.title}
              </p>
            </div>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {verdict.body}
            </p>
            <CompactList title="Evidencia" items={verdict.evidence} />
            <CompactList title="Incertidumbre" items={verdict.uncertainty} />
            <div className="mt-4 rounded-lg border bg-background/55 p-3">
              <p className="text-xs font-medium uppercase text-muted-foreground">
                Siguiente decisión
              </p>
              <p className="mt-1 text-sm leading-6 text-foreground">
                {verdict.nextDecision}
              </p>
            </div>
          </section>
        </CollapsibleSection>
      ) : null}

      {diagnostic ? (
        <CollapsibleSection
          id="diagnostic"
          isOpen={openSections.diagnostic}
          onToggle={toggleSection}
          title="Diagnóstico"
        >
          <section className="rounded-xl border bg-background/45 p-4">
            <p className="text-sm leading-6">{diagnostic.summary}</p>
            <CompactList title="Puntos débiles" items={diagnostic.weak_points} />
            <CompactList
              title="Riesgos críticos"
              items={diagnostic.critical_risks}
            />
            <CompactList title="Próximos pasos" items={diagnostic.next_steps} />
          </section>
        </CollapsibleSection>
      ) : null}

      {latestProject?.sparringQuestions?.length ? (
        <CollapsibleSection
          id="questions"
          isOpen={openSections.questions}
          onToggle={toggleSection}
          title="Preguntas"
        >
          <div className="flex flex-col gap-3 rounded-xl border bg-background/45 p-4">
            {latestProject.sparringQuestions.map((question, index) => (
              <p className="text-sm leading-6" key={`${question}-${index}`}>
                {index + 1}. {question}
              </p>
            ))}
          </div>
        </CollapsibleSection>
      ) : null}

      {latestProject?.structuredResponse ? (
        <CollapsibleSection
          id="refine"
          isOpen={openSections.refine}
          onToggle={toggleSection}
          title="Iterar"
        >
          <div className="rounded-xl border bg-background/45 p-4">
            <Button
              className="w-full"
              disabled={isBusy}
              onClick={onRequestRefinementQuestions}
              type="button"
              variant="outline"
            >
              Otro round crítico
            </Button>
            <p className="mt-3 text-xs leading-5 text-muted-foreground">
              Genera nuevas preguntas sin modificar el mapa actual.
            </p>
            {refinementQuestions.length > 0 ? (
              <p className="mt-2 text-xs leading-5 text-muted-foreground">
                Nuevo round creado. Responde las preguntas en el bloque central.
              </p>
            ) : null}
            <Textarea
              className="mt-4 min-h-20 resize-none text-sm leading-6"
              onChange={(event) =>
                onRefinementNoteChange(event.currentTarget.value)
              }
              placeholder="Opcional: orienta el próximo round hacia regulación, MVP, mercado..."
              value={refinementNote}
            />
          </div>
        </CollapsibleSection>
      ) : (
        <section className="mt-5 rounded-xl border border-primary/30 bg-primary/10 p-4 lg:mt-auto">
          <p className="text-sm font-medium text-foreground">Flujo V1</p>
          <p className="mt-2 text-xs leading-5 text-muted-foreground">
            Genera un mapa para activar veredicto, diagnóstico y refinamiento.
          </p>
        </section>
      )}
    </aside>
  );
}

interface CollapsibleSectionProps {
  children: ReactNode;
  id: string;
  isOpen: boolean;
  onToggle: (id: string) => void;
  title: string;
}

function CollapsibleSection({
  children,
  id,
  isOpen,
  onToggle,
  title,
}: CollapsibleSectionProps) {
  return (
    <section className="mt-5">
      <button
        className="flex w-full items-center justify-between rounded-lg border bg-background/45 px-3 py-2 text-left text-xs font-semibold uppercase text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        onClick={() => onToggle(id)}
        type="button"
      >
        {title}
        {isOpen ? (
          <ChevronDown aria-hidden="true" data-icon="inline-start" />
        ) : (
          <ChevronRight aria-hidden="true" data-icon="inline-start" />
        )}
      </button>
      {isOpen ? <div className="mt-3">{children}</div> : null}
    </section>
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

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[68px_minmax(0,1fr)] gap-2">
      <dt className="font-medium text-foreground">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function ErrorBlock({ message, title }: { message: string; title: string }) {
  return (
    <section className="mt-5 rounded-xl border border-destructive/40 bg-destructive/10 p-4">
      <p className="text-xs font-medium uppercase text-destructive">{title}</p>
      <p className="mt-2 text-xs leading-5 text-muted-foreground">{message}</p>
    </section>
  );
}

function AIErrorBlock({ error }: { error: AIErrorState }) {
  const friendlyMessage = getFriendlyAIErrorMessage(error.message);

  return (
    <section className="mt-5 rounded-xl border border-destructive/40 bg-destructive/10 p-4">
      <p className="text-xs font-medium uppercase text-destructive">
        No se ha completado el sparring
      </p>
      <p className="mt-2 text-xs leading-5 text-muted-foreground">
        {friendlyMessage}
      </p>
      {error.issues?.length || error.rawResponse || friendlyMessage !== error.message ? (
        <details className="mt-3 rounded-md border bg-background/45 px-3 py-2">
          <summary className="cursor-pointer text-xs font-medium text-foreground">
            Detalles para depuración
          </summary>
          {friendlyMessage !== error.message ? (
            <p className="mt-3 text-xs leading-5 text-muted-foreground">
              {error.message}
            </p>
          ) : null}
          {error.issues?.length ? (
            <ul className="mt-3 flex list-disc flex-col gap-1 pl-4 text-xs leading-5 text-muted-foreground">
              {error.issues.map((issue) => (
                <li key={issue}>{issue}</li>
              ))}
            </ul>
          ) : null}
          {error.rawResponse ? (
            <Button
              className="mt-3"
              onClick={() =>
                void navigator.clipboard.writeText(error.rawResponse ?? "")
              }
              size="sm"
              type="button"
              variant="outline"
            >
              Copiar respuesta técnica
            </Button>
          ) : null}
        </details>
      ) : null}
    </section>
  );
}

function getFriendlyAIErrorMessage(message: string) {
  const technicalError =
    /zod|schema|json|contrato|validaci[oó]n|parseable|contenido textual|respuesta vac[ií]a/i;

  if (technicalError.test(message)) {
    return "La IA no ha devuelto un resultado que SparringMap pueda utilizar. Se ha reintentado una vez y tu trabajo anterior sigue intacto.";
  }

  return message;
}

function CompactList({ items, title }: { items: string[]; title: string }) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="mt-4">
      <p className="text-xs font-medium uppercase text-muted-foreground">
        {title}
      </p>
      <ul className="mt-2 flex list-disc flex-col gap-1 pl-4 text-xs leading-5 text-muted-foreground">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

const priorityLabel: Record<NonNullable<MapNodeSelection["priority"]>, string> = {
  high: "Alta",
  low: "Baja",
  medium: "Media",
};

const nodeStatusOptions: Array<{
  activeClass: string;
  icon: typeof Circle;
  label: string;
  value: NodeReviewStatus;
}> = [
  {
    activeClass: "text-hypothesis",
    icon: Circle,
    label: "Pendiente",
    value: "pending",
  },
  {
    activeClass: "text-action",
    icon: CheckCircle2,
    label: "Validado",
    value: "validated",
  },
  {
    activeClass: "text-muted-foreground",
    icon: XCircle,
    label: "Descartado",
    value: "dismissed",
  },
  {
    activeClass: "text-risk",
    icon: Ban,
    label: "Bloqueado",
    value: "blocked",
  },
];

const verdictStatusLabel = {
  advance: "Avanzar",
  discard: "Descartar",
  reframe: "Replantear",
  validate: "Validar",
} as const;

function buildVerdict(project: SparringProject) {
  const aiVerdict = project.structuredResponse?.verdict;

  if (aiVerdict) {
    return {
      body: aiVerdict.rationale,
      evidence: aiVerdict.evidence,
      nextDecision: aiVerdict.next_decision,
      statusLabel: verdictStatusLabel[aiVerdict.status],
      title: aiVerdict.headline,
      tone: getVerdictTone(aiVerdict.status),
      uncertainty: aiVerdict.uncertainty,
    };
  }

  const score = project.readinessScore ?? 0;
  const diagnostic = project.structuredResponse?.diagnostic;
  const riskCount = diagnostic?.critical_risks.length ?? 0;

  if (score < 45 || riskCount >= 4) {
    return {
      body:
        "La idea es interesante, pero ahora mismo exige validación fuerte antes de invertir en desarrollo.",
      evidence: diagnostic?.critical_risks.slice(0, 3) ?? [],
      nextDecision: "Validar el bloqueo principal antes de invertir en desarrollo.",
      statusLabel: "Replantear",
      title: "No escalar todavía",
      tone: "risk" as const,
      uncertainty: diagnostic?.weak_points.slice(0, 3) ?? [],
    };
  }

  if (score < 75) {
    return {
      body:
        "Hay una oportunidad, pero todavía depende de supuestos relevantes.",
      evidence: diagnostic?.weak_points.slice(0, 3) ?? [],
      nextDecision: "Ejecutar una validación corta de los supuestos más críticos.",
      statusLabel: "Validar",
      title: "Validar antes de construir",
      tone: "warning" as const,
      uncertainty: diagnostic?.critical_risks.slice(0, 3) ?? [],
    };
  }

  return {
    body:
      "La idea tiene suficiente claridad inicial para pasar a plan de ejecución.",
    evidence: diagnostic?.next_steps.slice(0, 3) ?? [],
    nextDecision: "Convertir el mapa en un plan de ejecución priorizado.",
    statusLabel: "Avanzar",
    title: "Lista para plan accionable",
    tone: "positive" as const,
    uncertainty: diagnostic?.critical_risks.slice(0, 3) ?? [],
  };
}

function getVerdictTone(status: keyof typeof verdictStatusLabel) {
  if (status === "discard" || status === "reframe") {
    return "risk" as const;
  }

  if (status === "validate") {
    return "warning" as const;
  }

  return "positive" as const;
}

function getStatusLabel(
  uiStatus: UIStatus,
  workflowStage: WorkflowStage
) {
  if (uiStatus === "analyzing") {
    return workflowStage === "map"
      ? "Preparando nuevo round"
      : "Analizando idea";
  }

  if (uiStatus === "generating") {
    return workflowStage === "map" ? "Refinando mapa" : "Generando mapa";
  }

  if (uiStatus === "error") {
    return "Revisar error";
  }

  if (workflowStage === "map") {
    return "Mapa listo";
  }

  if (workflowStage === "questions") {
    return "Preguntas listas";
  }

  return "Idea pendiente";
}
