"use client";

import { FormEvent, useId, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AI_MODEL_OPTIONS, PROJECT_TYPE_OPTIONS } from "@/lib/constants";
import type { AIModelId, ProjectType, UIStatus } from "@/types";

export interface IdeaFormValues {
  aiModelId: AIModelId;
  rawInput: string;
  type: ProjectType;
}

interface IdeaFormProps {
  consultationMode?: boolean;
  hasExistingMap?: boolean;
  initialValues: IdeaFormValues;
  onChange: (values: IdeaFormValues) => void;
  onSubmitDraft: (values: IdeaFormValues) => void;
  uiStatus: UIStatus;
}

export function IdeaForm({
  consultationMode = false,
  hasExistingMap = false,
  initialValues,
  onChange,
  onSubmitDraft,
  uiStatus,
}: IdeaFormProps) {
  const textareaId = useId();
  const typeId = useId();
  const modelId = useId();
  const [submitted, setSubmitted] = useState(false);

  const trimmedInput = initialValues.rawInput.trim();
  const hasInput = trimmedInput.length > 0;
  const isBusy = uiStatus === "analyzing" || uiStatus === "generating";
  const selectedOption = PROJECT_TYPE_OPTIONS.find(
    (option) => option.value === initialValues.type
  );
  const selectedModel = AI_MODEL_OPTIONS.find(
    (option) => option.value === initialValues.aiModelId
  );

  function updateValues(nextValues: Partial<IdeaFormValues>) {
    setSubmitted(false);
    onChange({ ...initialValues, ...nextValues });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!hasInput || isBusy || consultationMode) {
      return;
    }

    setSubmitted(true);
    onSubmitDraft({
      aiModelId: initialValues.aiModelId,
      rawInput: trimmedInput,
      type: initialValues.type,
    });
  }

  return (
    <Card className="border-border/70 bg-card/90 shadow-sm backdrop-blur">
      <form onSubmit={handleSubmit}>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-1 md:flex-row md:items-end md:justify-between">
            <div>
              <CardTitle className="text-xl">Idea inicial</CardTitle>
              <CardDescription>
                Describe la idea que quieres ordenar, cuestionar y convertir en
                mapa.
              </CardDescription>
            </div>
            <p className="text-xs text-muted-foreground">
              {trimmedInput.length} caracteres
            </p>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">
          <div className="flex flex-col gap-2">
            <Label htmlFor={textareaId}>Idea o proyecto</Label>
            <Textarea
              className="min-h-36 resize-none text-[15px] leading-6"
              disabled={consultationMode}
              id={textareaId}
              onChange={(event) =>
                updateValues({ rawInput: event.currentTarget.value })
              }
              placeholder="Ejemplo: una app para convertir ideas de negocio en mapas de decisión con ayuda de IA."
              value={initialValues.rawInput}
            />
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor={typeId}>Tipo de proyecto</Label>
              <Select
                disabled={consultationMode}
                onValueChange={(value) =>
                  updateValues({ type: value as ProjectType })
                }
                value={initialValues.type}
              >
                <SelectTrigger id={typeId}>
                  <span className="truncate">{selectedOption?.label}</span>
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {PROJECT_TYPE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <p className="rounded-md border bg-background/45 px-3 py-2 text-xs leading-5 text-muted-foreground">
                {selectedOption?.description}
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor={modelId}>Modelo IA</Label>
              <Select
                disabled={consultationMode}
                onValueChange={(value) =>
                  updateValues({ aiModelId: value as AIModelId })
                }
                value={initialValues.aiModelId}
              >
                <SelectTrigger id={modelId}>
                  <span className="truncate">{selectedModel?.label}</span>
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {AI_MODEL_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <p className="rounded-md border bg-background/45 px-3 py-2 text-xs leading-5 text-muted-foreground">
                {selectedModel?.provider}: {selectedModel?.description}
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            {submitted
              ? hasExistingMap
                ? "Reanálisis solicitado. El mapa actual sigue protegido."
                : "Borrador guardado y análisis solicitado."
              : consultationMode
                ? "Etapa completada. Pulsa Editar idea para modificarla."
                : hasExistingMap
                  ? "Reanalizar esta idea puede cambiar las preguntas y el mapa. Te pediremos confirmación."
                  : "Primero se calculará el score y, si hace falta, preguntas críticas."}
          </p>
          <Button
            disabled={!hasInput || isBusy || consultationMode}
            type="submit"
          >
            {consultationMode
              ? "Etapa completada"
              : uiStatus === "analyzing"
                ? "Analizando..."
                : hasExistingMap
                  ? "Reanalizar idea"
                  : "Preparar sparring"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
