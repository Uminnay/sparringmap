"use client";

import { useMemo, useState } from "react";
import {
  ArrowDownToLine,
  ChevronDown,
  ChevronRight,
  GitCompareArrows,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { compareMapVersions } from "@/lib/versions";
import { cn } from "@/lib/utils";
import type { MapVersion } from "@/types";

interface VersionHistoryProps {
  currentVersionId?: string;
  onDeleteVersion: (versionId: string) => void;
  onRestoreVersion: (versionId: string) => void;
  versions: MapVersion[];
}

export function VersionHistory({
  currentVersionId,
  onDeleteVersion,
  onRestoreVersion,
  versions,
}: VersionHistoryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [comparisonVersionId, setComparisonVersionId] = useState<string>();
  const [pendingDelete, setPendingDelete] = useState<MapVersion>();
  const comparisonIndex = versions.findIndex(
    (version) => version.id === comparisonVersionId
  );
  const comparison = useMemo(() => {
    if (comparisonIndex <= 0) {
      return undefined;
    }

    return compareMapVersions(
      versions[comparisonIndex - 1],
      versions[comparisonIndex]
    );
  }, [comparisonIndex, versions]);

  if (versions.length === 0) {
    return null;
  }

  return (
    <section className="rounded-lg border bg-card/80 shadow-sm">
      <div className="flex items-center gap-2 p-3">
        <button
          aria-expanded={isOpen}
          className="flex min-w-0 flex-1 items-center gap-3 text-left"
          onClick={() => setIsOpen((value) => !value)}
          type="button"
        >
          {isOpen ? (
            <ChevronDown aria-hidden="true" className="shrink-0" />
          ) : (
            <ChevronRight aria-hidden="true" className="shrink-0" />
          )}
          <span className="min-w-0">
            <span className="block text-sm font-semibold">
              Historial de versiones
            </span>
            <span className="block text-xs text-muted-foreground">
              {versions.length} {versions.length === 1 ? "versión" : "versiones"}
            </span>
          </span>
        </button>
        <span className="rounded-md border bg-background/60 px-2 py-1 text-xs font-medium">
          {versions.find((version) => version.id === currentVersionId)?.label ??
            versions[versions.length - 1].label}
        </span>
      </div>

      {isOpen ? (
        <div className="border-t p-3 md:p-4">
          <div className="grid gap-2">
            {versions
              .slice()
              .reverse()
              .map((version) => {
                const isCurrent = version.id === currentVersionId;
                const originalIndex = versions.findIndex(
                  (item) => item.id === version.id
                );

                return (
                  <article
                    className={cn(
                      "rounded-lg border bg-background/45 p-3",
                      isCurrent && "border-primary/40 bg-primary/10"
                    )}
                    key={version.id}
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold">
                            {version.label}
                          </p>
                          {isCurrent ? (
                            <span className="rounded-md bg-primary px-2 py-0.5 text-[11px] font-medium text-primary-foreground">
                              Activa
                            </span>
                          ) : null}
                          <span className="text-xs text-muted-foreground">
                            {sourceLabel[version.source]}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {new Date(version.createdAt).toLocaleString("es-ES")}
                        </p>
                        {version.round ? (
                          <p className="mt-2 text-xs leading-5 text-muted-foreground">
                            {version.round.questions.length} preguntas ·{" "}
                            {
                              version.round.answers.filter((answer) =>
                                answer.trim()
                              ).length
                            }{" "}
                            respuestas
                            {version.round.note
                              ? ` · ${version.round.note}`
                              : ""}
                          </p>
                        ) : null}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {originalIndex > 0 ? (
                          <Button
                            onClick={() =>
                              setComparisonVersionId(
                                comparisonVersionId === version.id
                                  ? undefined
                                  : version.id
                              )
                            }
                            size="sm"
                            type="button"
                            variant="outline"
                          >
                            <GitCompareArrows aria-hidden="true" />
                            Comparar
                          </Button>
                        ) : null}
                        {!isCurrent ? (
                          <>
                            <Button
                              onClick={() => onRestoreVersion(version.id)}
                              size="sm"
                              type="button"
                              variant="outline"
                            >
                              <ArrowDownToLine aria-hidden="true" />
                              Restaurar
                            </Button>
                            <Button
                              aria-label={`Eliminar ${version.label}`}
                              onClick={() => setPendingDelete(version)}
                              size="icon"
                              title={`Eliminar ${version.label}`}
                              type="button"
                              variant="ghost"
                            >
                              <Trash2 aria-hidden="true" />
                            </Button>
                          </>
                        ) : null}
                      </div>
                    </div>

                    {comparisonVersionId === version.id && comparison ? (
                      <VersionComparisonSummary
                        comparison={comparison}
                        previousLabel={versions[originalIndex - 1].label}
                      />
                    ) : null}
                  </article>
                );
              })}
          </div>
        </div>
      ) : null}

      <ConfirmationDialog
        confirmLabel="Eliminar versión"
        description={
          pendingDelete
            ? `Se eliminará ${pendingDelete.label}. El resto del historial y la versión activa se conservarán.`
            : ""
        }
        isOpen={Boolean(pendingDelete)}
        onCancel={() => setPendingDelete(undefined)}
        onConfirm={() => {
          if (pendingDelete) {
            onDeleteVersion(pendingDelete.id);
          }
          setPendingDelete(undefined);
        }}
        title="¿Eliminar esta versión?"
      />
    </section>
  );
}

function VersionComparisonSummary({
  comparison,
  previousLabel,
}: {
  comparison: ReturnType<typeof compareMapVersions>;
  previousLabel: string;
}) {
  return (
    <div className="mt-3 grid gap-2 border-t pt-3 text-xs text-muted-foreground sm:grid-cols-2">
      <p>
        Comparada con <strong className="text-foreground">{previousLabel}</strong>
      </p>
      <p>
        Diagnóstico:{" "}
        <strong className="text-foreground">
          {comparison.diagnosticChanged ? "actualizado" : "sin cambios"}
        </strong>
      </p>
      <ChangeList label="Añadidos" items={comparison.added} tone="text-action" />
      <ChangeList
        label="Modificados"
        items={comparison.modified}
        tone="text-hypothesis"
      />
      <ChangeList label="Eliminados" items={comparison.removed} tone="text-risk" />
    </div>
  );
}

function ChangeList({
  items,
  label,
  tone,
}: {
  items: string[];
  label: string;
  tone: string;
}) {
  return (
    <div>
      <p className={cn("font-medium", tone)}>
        {label}: {items.length}
      </p>
      {items.length > 0 ? (
        <p className="mt-1 line-clamp-2 leading-5">{items.join(", ")}</p>
      ) : null}
    </div>
  );
}

const sourceLabel: Record<MapVersion["source"], string> = {
  initial: "Mapa inicial",
  refinement: "Round de refinamiento",
  regeneration: "Regeneración",
  restored: "Restaurada",
};
