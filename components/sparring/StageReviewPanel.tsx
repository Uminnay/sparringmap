"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown, ChevronRight, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";

interface StageReviewPanelProps {
  actionLabel: string;
  children: ReactNode;
  defaultOpen?: boolean;
  onEdit: () => void;
  summary: string;
  title: string;
}

export function StageReviewPanel({
  actionLabel,
  children,
  defaultOpen = false,
  onEdit,
  summary,
  title,
}: StageReviewPanelProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <section className="rounded-lg border bg-card/80 shadow-sm">
      <div className="flex min-w-0 items-center gap-2 p-3">
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
            <span className="block text-sm font-semibold">{title}</span>
            <span className="block truncate text-xs text-muted-foreground">
              {summary}
            </span>
          </span>
        </button>
        <Button onClick={onEdit} size="sm" type="button" variant="outline">
          <Pencil aria-hidden="true" data-icon="inline-start" />
          <span className="hidden sm:inline">{actionLabel}</span>
        </Button>
      </div>
      {isOpen ? <div className="border-t p-4">{children}</div> : null}
    </section>
  );
}
