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
import { PROJECT_TYPE_OPTIONS } from "@/lib/constants";
import type { ProjectType } from "@/types";

export interface IdeaFormValues {
  rawInput: string;
  type: ProjectType;
}

interface IdeaFormProps {
  initialValues: IdeaFormValues;
  onChange: (values: IdeaFormValues) => void;
}

export function IdeaForm({ initialValues, onChange }: IdeaFormProps) {
  const textareaId = useId();
  const typeId = useId();
  const [submitted, setSubmitted] = useState(false);

  const trimmedInput = initialValues.rawInput.trim();
  const hasInput = trimmedInput.length > 0;
  const selectedOption = PROJECT_TYPE_OPTIONS.find(
    (option) => option.value === initialValues.type
  );

  function updateValues(nextValues: Partial<IdeaFormValues>) {
    setSubmitted(false);
    onChange({ ...initialValues, ...nextValues });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <Card className="border-border/70 bg-card/90 shadow-sm backdrop-blur">
      <form onSubmit={handleSubmit}>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-1 md:flex-row md:items-end md:justify-between">
            <div>
              <CardTitle className="text-xl">Idea inicial</CardTitle>
              <CardDescription>
                Describe la idea que quieres ordenar, cuestionar y convertir en mapa.
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
              id={textareaId}
              placeholder="Ejemplo: una app para convertir ideas de negocio en mapas de decisión con ayuda de IA."
              value={initialValues.rawInput}
              onChange={(event) =>
                updateValues({ rawInput: event.currentTarget.value })
              }
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor={typeId}>Tipo de proyecto</Label>
            <Select
              value={initialValues.type}
              onValueChange={(value) =>
                updateValues({ type: value as ProjectType })
              }
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
        </CardContent>
        <CardFooter className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            {submitted
              ? "Borrador listo para la fase de análisis."
              : "La generación del mapa se activará en fases posteriores."}
          </p>
          <Button disabled={!hasInput} type="submit">
            Preparar sparring
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
