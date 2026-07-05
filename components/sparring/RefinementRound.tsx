"use client";

import { Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { UIStatus } from "@/types";

interface RefinementRoundProps {
  answers: string[];
  note: string;
  onAnswerChange: (index: number, value: string) => void;
  onNoteChange: (value: string) => void;
  onRefine: () => void;
  questions: string[];
  uiStatus: UIStatus;
}

export function RefinementRound({
  answers,
  note,
  onAnswerChange,
  onNoteChange,
  onRefine,
  questions,
  uiStatus,
}: RefinementRoundProps) {
  if (questions.length === 0) {
    return null;
  }

  const isGenerating = uiStatus === "generating";

  return (
    <section className="rounded-xl border border-primary/30 bg-card/90 p-4 shadow-sm md:p-5">
      <div>
        <p className="text-sm font-semibold">Nuevo round crítico</p>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          Responde aquí para incorporar el aprendizaje al mapa.
        </p>
        <p className="mt-2 text-xs leading-5 text-muted-foreground">
          Aplicar el refinamiento sustituirá el mapa actual después de pedirte
          confirmación.
        </p>
      </div>

      <div className="mt-5 flex flex-col gap-4">
        {questions.map((question, index) => (
          <div className="flex flex-col gap-2" key={`${question}-${index}`}>
            <Label htmlFor={`refinement-answer-${index}`}>
              Pregunta de refinamiento {index + 1}
            </Label>
            <p className="text-sm leading-6">{question}</p>
            <Textarea
              className="min-h-24 resize-none text-sm leading-6"
              id={`refinement-answer-${index}`}
              onChange={(event) =>
                onAnswerChange(index, event.currentTarget.value)
              }
              placeholder="Escribe tu respuesta para actualizar el mapa."
              value={answers[index] ?? ""}
            />
          </div>
        ))}

        <div className="flex flex-col gap-2">
          <Label htmlFor="refinement-note">Cambios adicionales</Label>
          <Textarea
            className="min-h-20 resize-none text-sm leading-6"
            id="refinement-note"
            onChange={(event) => onNoteChange(event.currentTarget.value)}
            placeholder="Ejemplo: prioriza un MVP más simple, añade monetización o reduce el alcance."
            value={note}
          />
        </div>

        <Button disabled={isGenerating} onClick={onRefine} type="button">
          <Send aria-hidden="true" data-icon="inline-start" />
          {isGenerating ? "Refinando mapa..." : "Aplicar respuestas al mapa"}
        </Button>
      </div>
    </section>
  );
}
