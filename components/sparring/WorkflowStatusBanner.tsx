import {
  AlertCircle,
  CheckCircle2,
  CircleDashed,
  LoaderCircle,
  MessageCircleQuestion,
} from "lucide-react";

import { cn } from "@/lib/utils";
import type { UIStatus, WorkflowStage } from "@/types";

interface WorkflowStatusBannerProps {
  currentVersionLabel?: string;
  hasIdea: boolean;
  hasMap: boolean;
  questionCount: number;
  refinementQuestionCount: number;
  uiStatus: UIStatus;
  workflowStage: WorkflowStage;
}

export function WorkflowStatusBanner({
  currentVersionLabel,
  hasIdea,
  hasMap,
  questionCount,
  refinementQuestionCount,
  uiStatus,
  workflowStage,
}: WorkflowStatusBannerProps) {
  const content = getStatusContent({
    hasIdea,
    hasMap,
    questionCount,
    refinementQuestionCount,
    uiStatus,
    workflowStage,
  });
  const Icon = content.icon;

  return (
    <section
      aria-live="polite"
      className={cn(
        "mb-3 flex items-start gap-3 rounded-lg border px-3 py-3 shadow-sm md:mb-4 md:px-4",
        content.tone === "neutral" && "bg-card/75",
        content.tone === "working" &&
          "border-primary/35 bg-primary/10",
        content.tone === "ready" && "border-action/35 bg-action/10",
        content.tone === "error" &&
          "border-destructive/40 bg-destructive/10"
      )}
      role={content.tone === "error" ? "alert" : "status"}
    >
      <Icon
        aria-hidden="true"
        className={cn(
          "mt-0.5 size-5 shrink-0",
          content.tone === "working" && "animate-spin text-primary",
          content.tone === "ready" && "text-action",
          content.tone === "error" && "text-destructive",
          content.tone === "neutral" && "text-muted-foreground"
        )}
      />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold">{content.title}</p>
          {hasMap ? (
            <span className="rounded-md border bg-background/60 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
              {currentVersionLabel ?? "Versión actual"}
            </span>
          ) : null}
          {workflowStage === "map" && refinementQuestionCount > 0 ? (
            <span className="rounded-md border border-hypothesis/35 bg-hypothesis/10 px-2 py-0.5 text-[11px] font-medium text-hypothesis">
              Round crítico activo
            </span>
          ) : null}
          {workflowStage === "questions" ? (
            <span className="rounded-md border bg-background/60 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
              Round inicial
            </span>
          ) : null}
        </div>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          {content.description}
        </p>
      </div>
    </section>
  );
}

type StatusInput = WorkflowStatusBannerProps;

function getStatusContent(input: StatusInput) {
  if (input.uiStatus === "error") {
    return {
      description:
        "Tu contenido anterior sigue guardado. Revisa el aviso del panel derecho y vuelve a intentarlo.",
      icon: AlertCircle,
      title: "No se ha completado la acción",
      tone: "error" as const,
    };
  }

  if (input.uiStatus === "analyzing") {
    return input.workflowStage === "map"
      ? {
          description:
            "Estamos buscando nuevos puntos débiles sin modificar el mapa actual.",
          icon: LoaderCircle,
          title: "Preparando otro round crítico",
          tone: "working" as const,
        }
      : {
          description:
            "Estamos evaluando la claridad, los supuestos y la información que falta.",
          icon: LoaderCircle,
          title: "Analizando la idea",
          tone: "working" as const,
        };
  }

  if (input.uiStatus === "generating") {
    return input.workflowStage === "map"
      ? {
          description:
            "El mapa actual se mantiene hasta que el refinamiento termine correctamente.",
          icon: LoaderCircle,
          title: "Aplicando el refinamiento",
          tone: "working" as const,
        }
      : {
          description:
            "Estamos convirtiendo la idea y las respuestas en un mapa estratégico.",
          icon: LoaderCircle,
          title: "Construyendo el mapa",
          tone: "working" as const,
        };
  }

  if (input.workflowStage === "map" && input.hasMap) {
    return {
      description:
        input.refinementQuestionCount > 0
          ? "Responde el nuevo round bajo el canvas. El mapa seguirá visible hasta que decidas aplicar los cambios."
          : "Explora los nodos, revisa el diagnóstico o inicia otro round crítico.",
      icon: CheckCircle2,
      title: "Mapa listo para trabajar",
      tone: "ready" as const,
    };
  }

  if (input.workflowStage === "questions") {
    return {
      description:
        input.questionCount > 0
          ? "Puedes responder las preguntas para afinar el resultado o generar el mapa igualmente."
          : "La idea tiene suficiente claridad para generar el mapa directamente.",
      icon: MessageCircleQuestion,
      title:
        input.questionCount > 0
          ? "Preguntas críticas preparadas"
          : "Listo para generar el mapa",
      tone: "ready" as const,
    };
  }

  return {
    description: input.hasIdea
      ? "Revisa el texto, el tipo de proyecto y el modelo antes de preparar el sparring."
      : "Describe la idea que quieres cuestionar y convertir en un mapa accionable.",
    icon: CircleDashed,
    title: input.hasIdea ? "Idea preparada" : "Empieza por tu idea",
    tone: "neutral" as const,
  };
}
