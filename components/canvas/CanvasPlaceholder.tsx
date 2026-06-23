import { NODE_TYPE_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { ProjectType } from "@/types";

interface CanvasPlaceholderProps {
  projectType: ProjectType;
  hasDraft: boolean;
}

const toneStyles = {
  objective: "border-objective/35 bg-objective/10 text-objective",
  risk: "border-risk/35 bg-risk/10 text-risk",
  action: "border-action/35 bg-action/10 text-action",
  hypothesis: "border-hypothesis/35 bg-hypothesis/10 text-hypothesis",
} as const;

export function CanvasPlaceholder({
  projectType,
  hasDraft,
}: CanvasPlaceholderProps) {
  return (
    <section className="relative min-h-[520px] overflow-hidden rounded-xl border bg-canvas shadow-sm">
      <div className="absolute inset-0 opacity-55 [background-image:linear-gradient(var(--border)_1px,transparent_1px),linear-gradient(90deg,var(--border)_1px,transparent_1px)] [background-size:44px_44px]" />
      <div className="absolute inset-x-10 top-8 h-28 rounded-full bg-primary/10 blur-3xl" />

      <div className="relative flex h-full min-h-[520px] items-center justify-center p-5 md:p-8">
        <div className="relative h-[420px] w-full max-w-5xl">
          <GuideLine className="left-1/2 top-[78px] h-[120px] w-px" />
          <GuideLine className="bottom-[78px] left-1/2 h-[120px] w-px" />
          <GuideLine className="left-[calc(50%-260px)] top-1/2 h-px w-[180px]" />
          <GuideLine className="right-[calc(50%-260px)] top-1/2 h-px w-[180px]" />

          <PlaceholderGroup
            className="left-1/2 top-0 -translate-x-1/2"
            label={NODE_TYPE_LABELS.objective}
            tone="objective"
          />
          <PlaceholderGroup
            className="left-[max(16px,calc(50%-390px))] top-1/2 -translate-y-1/2"
            label={NODE_TYPE_LABELS.risk}
            tone="risk"
          />
          <CentralNode hasDraft={hasDraft} />
          <PlaceholderGroup
            className="right-[max(16px,calc(50%-390px))] top-1/2 -translate-y-1/2"
            label={NODE_TYPE_LABELS.action}
            tone="action"
          />
          <PlaceholderGroup
            className="bottom-0 left-1/2 -translate-x-1/2"
            label={NODE_TYPE_LABELS.hypothesis}
            tone="hypothesis"
          />
        </div>
      </div>

      <div className="absolute bottom-4 left-4 rounded-md border bg-background/80 px-3 py-2 text-xs text-muted-foreground shadow-sm backdrop-blur">
        Layout reservado:{" "}
        {projectType === "app_product" ? "producto app" : "estrategia negocio"}
      </div>
    </section>
  );
}

interface CentralNodeProps {
  hasDraft: boolean;
}

function CentralNode({ hasDraft }: CentralNodeProps) {
  return (
    <div className="absolute left-1/2 top-1/2 grid size-44 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-primary/55 bg-primary/15 text-center shadow-[0_0_90px_rgba(139,92,246,0.24)]">
      <div className="px-5">
        <p className="text-sm font-semibold text-foreground">
          {NODE_TYPE_LABELS.central}
        </p>
        <p className="mt-2 text-xs leading-5 text-muted-foreground">
          {hasDraft ? "Borrador preparado" : "Sin input todavía"}
        </p>
      </div>
    </div>
  );
}

interface PlaceholderGroupProps {
  className: string;
  label: string;
  tone: keyof typeof toneStyles;
}

function PlaceholderGroup({ className, label, tone }: PlaceholderGroupProps) {
  return (
    <div
      className={cn(
        "absolute min-w-36 rounded-lg border px-4 py-3 text-center text-sm font-medium shadow-sm backdrop-blur",
        toneStyles[tone],
        className
      )}
    >
      {label}
      <div className="mt-2 flex justify-center gap-1">
        <span className="block h-1.5 w-7 rounded-full bg-current opacity-55" />
        <span className="block h-1.5 w-4 rounded-full bg-current opacity-30" />
      </div>
    </div>
  );
}

function GuideLine({ className }: { className: string }) {
  return (
    <div
      className={cn(
        "absolute origin-center bg-border/75 shadow-[0_0_18px_rgba(139,92,246,0.16)]",
        className
      )}
    />
  );
}
