"use client";

import { useRef, useState, type ChangeEvent } from "react";
import {
  Archive,
  ArchiveRestore,
  Copy,
  FolderOpen,
  Import,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { parseProjectTransfer } from "@/lib/project-transfer";
import type { SparringProject } from "@/types";

interface ProjectLibraryProps {
  mode: "archive" | "drafts";
  onArchiveToggle: (project: SparringProject) => void;
  onDeleteProject: (project: SparringProject) => void;
  onDuplicateProject: (project: SparringProject) => void;
  onImportProject: (project: SparringProject) => void;
  onOpenProject: (project: SparringProject) => void;
  projects: SparringProject[];
}

export function ProjectLibrary({
  mode,
  onArchiveToggle,
  onDeleteProject,
  onDuplicateProject,
  onImportProject,
  onOpenProject,
  projects,
}: ProjectLibraryProps) {
  const importInputRef = useRef<HTMLInputElement>(null);
  const [pendingDelete, setPendingDelete] = useState<SparringProject>();
  const [importMessage, setImportMessage] = useState<{
    text: string;
    tone: "error" | "success";
  }>();
  const visibleProjects = projects.filter((project) =>
    mode === "archive"
      ? project.status === "archived"
      : project.status !== "archived"
  );

  async function handleImport(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";

    if (!file) {
      return;
    }

    const result = parseProjectTransfer(await file.text());

    if (!result.ok) {
      setImportMessage({ text: result.error, tone: "error" });
      return;
    }

    onImportProject(result.project);
    setImportMessage({
      text: `Proyecto importado: ${result.project.title}`,
      tone: "success",
    });
  }

  return (
    <section className="min-h-[680px] min-w-0 max-w-full rounded-xl border bg-card/75 p-5 shadow-sm md:p-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">
            {mode === "archive" ? "Archivo" : "Borradores"}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "archive"
              ? "Proyectos apartados que puedes restaurar."
              : "Proyectos guardados en este navegador."}
          </p>
        </div>
        <div>
          <input
            accept="application/json,.json"
            className="sr-only"
            onChange={(event) => void handleImport(event)}
            ref={importInputRef}
            type="file"
          />
          <Button
            onClick={() => importInputRef.current?.click()}
            type="button"
            variant="outline"
          >
            <Import aria-hidden="true" data-icon="inline-start" />
            Importar JSON
          </Button>
        </div>
      </div>

      <div className="mt-4 rounded-lg border bg-background/45 px-4 py-3 text-xs leading-5 text-muted-foreground">
        El guardado es local: solo está disponible en este navegador. Exporta
        un JSON como copia de seguridad antes de borrar sus datos o cambiar de
        dispositivo.
      </div>

      {importMessage ? (
        <p
          className={
            importMessage.tone === "error"
              ? "mt-3 text-sm text-destructive"
              : "mt-3 text-sm text-action"
          }
          role={importMessage.tone === "error" ? "alert" : "status"}
        >
          {importMessage.text}
        </p>
      ) : null}

      {visibleProjects.length > 0 ? (
        <div className="mt-6 grid min-w-0 grid-cols-[minmax(0,1fr)] gap-3 xl:grid-cols-2">
          {visibleProjects.map((project) => (
            <article
              className="min-w-0 rounded-lg border bg-background/55 p-4"
              key={project.id}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-semibold">{project.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {project.status === "mapped"
                      ? "Mapa generado"
                      : project.status === "archived"
                        ? "Archivado"
                        : "Borrador"}
                    {" · "}
                    {new Date(project.updatedAt).toLocaleDateString("es-ES")}
                  </p>
                </div>
                {project.readinessScore !== undefined ? (
                  <span className="rounded-md border bg-card px-2 py-1 text-xs font-medium">
                    {project.readinessScore}/100
                  </span>
                ) : null}
              </div>

              <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground">
                {project.structuredResponse?.summary ?? project.rawInput}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  onClick={() => onOpenProject(project)}
                  size="sm"
                  type="button"
                >
                  <FolderOpen aria-hidden="true" data-icon="inline-start" />
                  Abrir
                </Button>
                <Button
                  onClick={() => onDuplicateProject(project)}
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  <Copy aria-hidden="true" data-icon="inline-start" />
                  Duplicar
                </Button>
                <Button
                  onClick={() => onArchiveToggle(project)}
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  {mode === "archive" ? (
                    <ArchiveRestore
                      aria-hidden="true"
                      data-icon="inline-start"
                    />
                  ) : (
                    <Archive aria-hidden="true" data-icon="inline-start" />
                  )}
                  {mode === "archive" ? "Restaurar" : "Archivar"}
                </Button>
                <Button
                  aria-label={`Eliminar ${project.title}`}
                  onClick={() => setPendingDelete(project)}
                  size="icon"
                  title="Eliminar definitivamente"
                  type="button"
                  variant="ghost"
                >
                  <Trash2 aria-hidden="true" />
                </Button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-lg border border-dashed p-8 text-center">
          <p className="text-sm font-medium">
            {mode === "archive"
              ? "No hay proyectos archivados."
              : "Todavía no hay proyectos guardados."}
          </p>
          <p className="mt-2 text-xs leading-5 text-muted-foreground">
            {mode === "archive"
              ? "Los proyectos que archives aparecerán aquí."
              : "Analiza una idea o importa una copia de seguridad para empezar."}
          </p>
        </div>
      )}

      <ConfirmationDialog
        confirmLabel="Eliminar definitivamente"
        description={
          pendingDelete
            ? `Se eliminará “${pendingDelete.title}” de este navegador. Esta acción no se puede deshacer.`
            : ""
        }
        isOpen={Boolean(pendingDelete)}
        onCancel={() => setPendingDelete(undefined)}
        onConfirm={() => {
          if (pendingDelete) {
            onDeleteProject(pendingDelete);
          }
          setPendingDelete(undefined);
        }}
        title="¿Eliminar este proyecto?"
      />
    </section>
  );
}
