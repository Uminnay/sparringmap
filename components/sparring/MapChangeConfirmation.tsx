"use client";

import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";

interface MapChangeConfirmationProps {
  confirmLabel: string;
  description: string;
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  title: string;
}

export function MapChangeConfirmation({
  confirmLabel,
  description,
  isOpen,
  onCancel,
  onConfirm,
  title,
}: MapChangeConfirmationProps) {
  return (
    <ConfirmationDialog
      confirmLabel={confirmLabel}
      description={description}
      isOpen={isOpen}
      onCancel={onCancel}
      onConfirm={onConfirm}
      title={title}
    >
      <div className="mt-5 rounded-md border bg-background/50 px-3 py-2 text-xs leading-5 text-muted-foreground">
        El mapa actual se mantendrá si la nueva generación falla. El historial
        de versiones llegará en una fase posterior.
      </div>
    </ConfirmationDialog>
  );
}
