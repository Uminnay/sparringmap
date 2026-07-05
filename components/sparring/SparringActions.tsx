"use client";

import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AI_MODEL_OPTIONS } from "@/lib/constants";
import type { SparringProject, UIStatus } from "@/types";

interface SparringActionsProps {
  answers: string[];
  consultationMode?: boolean;
  hasExistingMap?: boolean;
  latestProject?: SparringProject;
  onAnswerChange: (index: number, value: string) => void;
  onGenerateMap: (useAnswers: boolean) => void;
  uiStatus: UIStatus;
}

export function SparringActions({
  answers,
  consultationMode = false,
  hasExistingMap = false,
  latestProject,
  onAnswerChange,
  onGenerateMap,
  uiStatus,
}: SparringActionsProps) {
  if (latestProject?.readinessScore === undefined) {
    return null;
  }

  const questions = latestProject.sparringQuestions ?? [];
  const isGenerating = uiStatus === "generating";
  const model = AI_MODEL_OPTIONS.find(
    (option) => option.value === latestProject.aiModelId
  );

  return (
    <section className="rounded-xl border bg-card/90 p-4 shadow-sm backdrop-blur md:p-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-semibold">Resultado del primer sparring</p>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Score {latestProject.readinessScore}/100 con {model?.label}.{" "}
            {consultationMode
              ? "Esta etapa está completada y se muestra en modo consulta."
              : hasExistingMap
                ? "Cambiar estas respuestas regenerará el mapa actual tras tu confirmación."
              : questions.length > 0
                ? "Conviene responder antes de generar el mapa."
                : "La idea puede pasar directamente al mapa."}
          </p>
        </div>
        <Button
          disabled={isGenerating || consultationMode}
          onClick={() => onGenerateMap(questions.length > 0)}
          type="button"
        >
          <Sparkles aria-hidden="true" data-icon="inline-start" />
          {consultationMode
            ? "Etapa completada"
            : isGenerating
              ? "Generando..."
              : hasExistingMap
                ? "Regenerar mapa"
                : "Generar mapa"}
        </Button>
      </div>

      {questions.length > 0 ? (
        <div className="mt-5 flex flex-col gap-4">
          {questions.map((question, index) => (
            <div className="flex flex-col gap-2" key={question}>
              <Label htmlFor={`sparring-answer-${index}`}>
                Pregunta crítica {index + 1}
              </Label>
              <p className="text-sm leading-6 text-foreground">{question}</p>
              <Textarea
                className="min-h-20 resize-none text-sm leading-6"
                disabled={consultationMode}
                id={`sparring-answer-${index}`}
                onChange={(event) =>
                  onAnswerChange(index, event.currentTarget.value)
                }
                placeholder="Respuesta opcional para afinar el diagnóstico."
                value={answers[index] ?? ""}
              />
            </div>
          ))}

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              disabled={isGenerating || consultationMode}
              onClick={() => onGenerateMap(true)}
              type="button"
            >
              {consultationMode
                ? "Etapa completada"
                : isGenerating
                  ? "Generando estructura..."
                  : hasExistingMap
                    ? "Regenerar con respuestas"
                    : "Generar con respuestas"}
            </Button>
            <Button
              disabled={isGenerating || consultationMode}
              onClick={() => onGenerateMap(false)}
              type="button"
              variant="outline"
            >
              {isGenerating
                ? "Espera un momento"
                : hasExistingMap
                  ? "Regenerar sin respuestas"
                  : "Generar igualmente"}
            </Button>
          </div>
          {isGenerating ? (
            <p className="text-xs leading-5 text-muted-foreground">
              Estamos convirtiendo las respuestas en un mapa estratégico.
              Puede tardar unos segundos.
            </p>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
