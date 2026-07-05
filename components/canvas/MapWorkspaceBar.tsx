"use client";

import { useState, type ReactNode } from "react";
import {
  Check,
  ChevronDown,
  ClipboardCopy,
  Download,
  FileJson,
  FileText,
  Printer,
  Save,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  createExecutiveSummaryText,
  createProjectDocumentHTML,
} from "@/lib/document-export";
import { formatProjectMarkdown } from "@/lib/markdown";
import { createProjectTransferJSON } from "@/lib/project-transfer";
import type { SparringProject } from "@/types";

interface MapWorkspaceBarProps {
  children?: ReactNode;
  compact?: boolean;
  latestProject?: SparringProject;
  onProjectNameChange: (value: string) => void;
  onSaveProject: () => void;
  projectName: string;
  savedNotice?: string;
}

export function MapWorkspaceBar({
  children,
  compact = false,
  latestProject,
  onProjectNameChange,
  onSaveProject,
  projectName,
  savedNotice,
}: MapWorkspaceBarProps) {
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const canExport = Boolean(latestProject?.structuredResponse);

  async function handleCopySummary() {
    if (!latestProject?.structuredResponse) {
      return;
    }

    await navigator.clipboard.writeText(createExecutiveSummaryText(latestProject));
    setCopiedSummary(true);
    window.setTimeout(() => setCopiedSummary(false), 1800);
  }

  function handleDownloadMarkdown() {
    if (!latestProject?.structuredResponse) {
      return;
    }

    downloadTextFile(
      `${safeFilename(latestProject.title)}.md`,
      formatProjectMarkdown(latestProject),
      "text/markdown"
    );
  }

  function handleDownloadJSON() {
    if (!latestProject?.structuredResponse) {
      return;
    }

    downloadTextFile(
      `${safeFilename(latestProject.title)}.json`,
      createProjectTransferJSON(latestProject),
      "application/json"
    );
  }

  function handleDownloadDocument() {
    if (!latestProject?.structuredResponse) {
      return;
    }

    downloadTextFile(
      `${safeFilename(latestProject.title)}.doc`,
      createProjectDocumentHTML(latestProject),
      "application/msword;charset=utf-8"
    );
  }

  return (
    <section
      className={
        compact
          ? "rounded-lg border bg-card/85 p-2 shadow-sm backdrop-blur"
          : "rounded-xl border bg-card/90 p-3 shadow-sm backdrop-blur md:p-4"
      }
    >
      <div className="flex flex-col gap-2 xl:flex-row xl:items-center xl:justify-between">
        <label className="grid min-w-0 flex-1 gap-1 text-xs font-medium uppercase text-muted-foreground md:grid-cols-[88px_minmax(0,1fr)] md:items-center">
          Proyecto
          <input
            className={
              compact
                ? "h-8 min-w-0 rounded-md border bg-background px-2 text-sm font-normal normal-case text-foreground outline-none ring-offset-background focus:ring-2 focus:ring-ring"
                : "h-10 min-w-0 rounded-md border bg-background px-3 text-sm font-normal normal-case text-foreground outline-none ring-offset-background focus:ring-2 focus:ring-ring"
            }
            disabled={!latestProject}
            onChange={(event) => onProjectNameChange(event.currentTarget.value)}
            placeholder="Nombre para guardar"
            value={projectName}
          />
        </label>

        <div className="flex flex-wrap gap-1.5">
          <Button
            disabled={!latestProject}
            onClick={onSaveProject}
            size={compact ? "sm" : "default"}
            type="button"
            variant="outline"
          >
            <Save aria-hidden="true" data-icon="inline-start" />
            {savedNotice ?? "Guardar"}
          </Button>
          <Button
            disabled={!canExport}
            onClick={() => void handleCopySummary()}
            size={compact ? "sm" : "default"}
            title="Copiar veredicto, riesgos y acciones principales"
            type="button"
            variant="outline"
          >
            {copiedSummary ? (
              <Check aria-hidden="true" data-icon="inline-start" />
            ) : (
              <ClipboardCopy aria-hidden="true" data-icon="inline-start" />
            )}
            {copiedSummary ? "Copiado" : "Resumen"}
          </Button>
          <Button
            aria-expanded={isExportOpen}
            disabled={!canExport}
            onClick={() => setIsExportOpen((value) => !value)}
            size={compact ? "sm" : "default"}
            type="button"
            variant="outline"
          >
            <Download aria-hidden="true" data-icon="inline-start" />
            Exportar
            <ChevronDown
              aria-hidden="true"
              className={
                isExportOpen
                  ? "rotate-180 transition-transform"
                  : "transition-transform"
              }
            />
          </Button>
        </div>
      </div>

      {isExportOpen ? (
        <div className="mt-2 grid gap-2 rounded-lg border bg-background/60 p-2 text-sm md:grid-cols-2 xl:grid-cols-4">
          <ExportOption
            description="Editable en Word o Google Docs."
            disabled={!canExport}
            icon={<FileText aria-hidden="true" />}
            label="Documento"
            onClick={handleDownloadDocument}
          />
          <ExportOption
            description="Markdown para Notion o documentacion."
            disabled={!canExport}
            icon={<Download aria-hidden="true" />}
            label="Notas"
            onClick={handleDownloadMarkdown}
          />
          <ExportOption
            description="Vista limpia para imprimir o guardar PDF."
            disabled={!canExport}
            icon={<Printer aria-hidden="true" />}
            label="Informe"
            onClick={() => window.print()}
          />
          <ExportOption
            description="Copia completa para reimportar el mapa."
            disabled={!canExport}
            icon={<FileJson aria-hidden="true" />}
            label="Backup"
            onClick={handleDownloadJSON}
          />
          <p className="text-xs leading-5 text-muted-foreground md:col-span-2 xl:col-span-4">
            El backup conserva versiones, posiciones y estados del mapa. Usalo
            para mover o recuperar el proyecto; no es el formato pensado para
            leer.
          </p>
        </div>
      ) : null}

      {children ? (
        <div className={compact ? "mt-2" : "mt-3"}>{children}</div>
      ) : null}
    </section>
  );
}

function ExportOption({
  description,
  disabled,
  icon,
  label,
  onClick,
}: {
  description: string;
  disabled: boolean;
  icon: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className="flex min-h-20 items-start gap-2 rounded-md border bg-card/80 px-3 py-2 text-left transition-colors hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50"
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      <span className="mt-0.5 text-primary">{icon}</span>
      <span>
        <span className="block font-medium">{label}</span>
        <span className="mt-1 block text-xs leading-5 text-muted-foreground">
          {description}
        </span>
      </span>
    </button>
  );
}

function downloadTextFile(filename: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function safeFilename(value: string) {
  return (
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/gi, "-")
      .replace(/^-|-$/g, "") || "sparringmap"
  );
}
