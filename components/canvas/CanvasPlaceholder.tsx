"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Eye,
  EyeOff,
  Focus,
  GitBranch,
  LayoutGrid,
  LocateFixed,
  Map,
  Maximize2,
  Minimize2,
  Redo2,
  Undo2,
} from "lucide-react";
import {
  Background,
  BackgroundVariant,
  Controls,
  Handle,
  MarkerType,
  MiniMap,
  Position,
  ReactFlow,
  type Edge,
  type Node,
  type NodeProps,
  type ReactFlowInstance,
  type Viewport,
  useEdgesState,
  useNodesState,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { Button } from "@/components/ui/button";
import { NODE_TYPE_LABELS } from "@/lib/constants";
import { buildDeterministicNodePositions } from "@/lib/map-layout";
import { cn } from "@/lib/utils";
import type {
  AINode,
  AIStructuredResponse,
  MapLayoutState,
  MapNodeSelection,
  NodeReviewStatus,
  NodeType,
  ProjectType,
} from "@/types";

interface CanvasPlaceholderProps {
  hasDraft: boolean;
  mapLayout?: MapLayoutState;
  onMapLayoutChange: (layout: MapLayoutState) => void;
  onNodeSelect: (node?: MapNodeSelection) => void;
  projectType: ProjectType;
  structuredResponse?: AIStructuredResponse;
}

type VisibleKind = Exclude<NodeType, "central">;
type StrategicNodeKind = NodeType | "empty";
type PriorityFilter = "all" | "high";

interface StrategicNodeData extends Record<string, unknown> {
  compact: boolean;
  description: string;
  isKey: boolean;
  kind: StrategicNodeKind;
  label: string;
  priority?: AINode["priority"];
  reviewStatus?: NodeReviewStatus;
}

const nodeTypes = {
  strategic: StrategicNode,
};

const visibleKindLabels: Record<VisibleKind, string> = {
  action: NODE_TYPE_LABELS.action,
  hypothesis: NODE_TYPE_LABELS.hypothesis,
  objective: NODE_TYPE_LABELS.objective,
  risk: NODE_TYPE_LABELS.risk,
};

const mapTone: Record<
  StrategicNodeKind,
  {
    accent: string;
    bg: string;
    border: string;
    dot: string;
    label: string;
  }
> = {
  action: {
    accent: "text-action",
    bg: "bg-action/10",
    border: "border-action/35",
    dot: "bg-action",
    label: NODE_TYPE_LABELS.action,
  },
  central: {
    accent: "text-primary",
    bg: "bg-primary/15",
    border: "border-primary/45",
    dot: "bg-primary",
    label: NODE_TYPE_LABELS.central,
  },
  empty: {
    accent: "text-muted-foreground",
    bg: "bg-card/85",
    border: "border-border",
    dot: "bg-muted-foreground",
    label: "Mapa pendiente",
  },
  hypothesis: {
    accent: "text-hypothesis",
    bg: "bg-hypothesis/10",
    border: "border-hypothesis/35",
    dot: "bg-hypothesis",
    label: NODE_TYPE_LABELS.hypothesis,
  },
  objective: {
    accent: "text-objective",
    bg: "bg-objective/10",
    border: "border-objective/35",
    dot: "bg-objective",
    label: NODE_TYPE_LABELS.objective,
  },
  risk: {
    accent: "text-risk",
    bg: "bg-risk/10",
    border: "border-risk/35",
    dot: "bg-risk",
    label: NODE_TYPE_LABELS.risk,
  },
};

const initialVisibleKinds: Record<VisibleKind, boolean> = {
  action: true,
  hypothesis: true,
  objective: true,
  risk: true,
};

export function CanvasPlaceholder({
  hasDraft,
  mapLayout,
  onMapLayoutChange,
  onNodeSelect,
  projectType,
  structuredResponse,
}: CanvasPlaceholderProps) {
  const [showMiniMap, setShowMiniMap] = useState(true);
  const [showDependencies, setShowDependencies] = useState(false);
  const [compactNodes, setCompactNodes] = useState(false);
  const [priorityFilter, setPriorityFilter] =
    useState<PriorityFilter>("all");
  const [visibleKinds, setVisibleKinds] =
    useState<Record<VisibleKind, boolean>>(initialVisibleKinds);
  const [undoStack, setUndoStack] = useState<
    Array<MapLayoutState["nodePositions"]>
  >([]);
  const [redoStack, setRedoStack] = useState<
    Array<MapLayoutState["nodePositions"]>
  >([]);
  const dragStartPositionsRef = useRef<
    MapLayoutState["nodePositions"] | undefined
  >(undefined);
  const [flowInstance, setFlowInstance] =
    useState<ReactFlowInstance<Node<StrategicNodeData>, Edge>>();
  const layoutRef = useRef<MapLayoutState>(
    mapLayout ?? { nodePositions: {} }
  );
  const baseNodes = useMemo(
    () =>
      buildStrategicNodes({
        compact: compactNodes,
        hasDraft,
        nodeStatuses: mapLayout?.nodeStatuses,
        structuredResponse,
      }),
    [compactNodes, hasDraft, mapLayout?.nodeStatuses, structuredResponse]
  );
  const filteredNodes = useMemo(
    () => filterNodes(baseNodes, visibleKinds, priorityFilter),
    [baseNodes, priorityFilter, visibleKinds]
  );
  const visibleNodeIds = useMemo(
    () => new Set(filteredNodes.map((node) => node.id)),
    [filteredNodes]
  );
  const initialNodes = useMemo(
    () => applyNodePositions(filteredNodes, mapLayout?.nodePositions ?? {}),
    [filteredNodes, mapLayout]
  );
  const initialEdges = useMemo(
    () =>
      buildStrategicEdges({
        showDependencies,
        structuredResponse,
        visibleKinds,
        visibleNodeIds,
      }),
    [showDependencies, structuredResponse, visibleKinds, visibleNodeIds]
  );
  const mapStats = useMemo(
    () => calculateMapStats(structuredResponse),
    [structuredResponse]
  );
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    layoutRef.current = mapLayout ?? { nodePositions: {} };
  }, [mapLayout]);

  useEffect(() => {
    setNodes(
      applyNodePositions(filteredNodes, layoutRef.current.nodePositions)
    );
    setEdges(initialEdges);

    if (!flowInstance || !structuredResponse) {
      return;
    }

    if (layoutRef.current.viewport) {
      void flowInstance.setViewport(layoutRef.current.viewport);
      return;
    }

    window.requestAnimationFrame(() => {
      void flowInstance.fitView({ maxZoom: 1.08, padding: 0.18 });
    });
  }, [
    filteredNodes,
    flowInstance,
    initialEdges,
    setEdges,
    setNodes,
    structuredResponse,
  ]);

  const persistLayout = useCallback(
    (
      nodePositions: MapLayoutState["nodePositions"],
      viewport?: Viewport,
      nodeStatuses = layoutRef.current.nodeStatuses
    ) => {
      const nextLayout: MapLayoutState = {
        nodePositions,
        nodeStatuses,
        viewport: viewport ?? layoutRef.current.viewport,
      };

      layoutRef.current = nextLayout;
      onMapLayoutChange(nextLayout);
    },
    [onMapLayoutChange]
  );

  function handleKindToggle(kind: VisibleKind) {
    setVisibleKinds((current) => ({
      ...current,
      [kind]: !current[kind],
    }));
  }

  function handleReorganize() {
    if (!structuredResponse) {
      return;
    }

    const nodePositions = buildDeterministicNodePositions(structuredResponse);
    pushUndoSnapshot(readNodePositions(nodes, layoutRef.current.nodePositions));
    setNodes((currentNodes) =>
      applyNodePositions(currentNodes, nodePositions)
    );
    persistLayout(nodePositions);

    window.requestAnimationFrame(() => {
      void flowInstance?.fitView({
        duration: 300,
        maxZoom: 1.08,
        padding: 0.18,
      });
    });
  }

  function handleRecenter() {
    void flowInstance?.fitView({
      duration: 300,
      maxZoom: 1.08,
      padding: 0.18,
    });
  }

  function pushUndoSnapshot(
    nodePositions: MapLayoutState["nodePositions"]
  ) {
    setUndoStack((current) => [
      ...current.slice(-24),
      clonePositions(nodePositions),
    ]);
    setRedoStack([]);
  }

  function handleUndo() {
    const previous = undoStack[undoStack.length - 1];

    if (!previous) {
      return;
    }

    const currentPositions = clonePositions(
      layoutRef.current.nodePositions
    );
    setUndoStack((current) => current.slice(0, -1));
    setRedoStack((current) => [...current, currentPositions]);
    setNodes((currentNodes) =>
      applyNodePositions(currentNodes, previous)
    );
    persistLayout(previous);
  }

  function handleRedo() {
    const next = redoStack[redoStack.length - 1];

    if (!next) {
      return;
    }

    const currentPositions = clonePositions(
      layoutRef.current.nodePositions
    );
    setRedoStack((current) => current.slice(0, -1));
    setUndoStack((current) => [...current, currentPositions]);
    setNodes((currentNodes) => applyNodePositions(currentNodes, next));
    persistLayout(next);
  }

  return (
    <section className="relative min-h-[640px] overflow-hidden rounded-xl border bg-canvas shadow-sm md:min-h-[760px]">
      <ReactFlow
        className="strategic-flow"
        colorMode="dark"
        defaultEdgeOptions={{
          style: {
            stroke: "var(--border)",
            strokeWidth: 1.7,
          },
        }}
        defaultViewport={mapLayout?.viewport}
        edges={edges}
        fitView={!mapLayout?.viewport}
        fitViewOptions={{ maxZoom: 1.08, padding: 0.18 }}
        maxZoom={1.4}
        minZoom={0.35}
        nodeTypes={nodeTypes}
        nodes={nodes}
        nodesDraggable
        nodesFocusable
        onEdgesChange={onEdgesChange}
        onInit={setFlowInstance}
        onMoveEnd={(_, viewport) =>
          persistLayout(layoutRef.current.nodePositions, viewport)
        }
        onNodeClick={(_, node) => {
          const data = node.data;

          if (data.kind !== "empty") {
            onNodeSelect({
              description: data.description,
              id: node.id,
              kind: data.kind,
              label: data.label,
              priority: data.priority,
              reviewStatus: data.reviewStatus,
            });
          }
        }}
        onNodeDragStart={() => {
          dragStartPositionsRef.current = readNodePositions(
            nodes,
            layoutRef.current.nodePositions
          );
        }}
        onNodeDragStop={(_, node) => {
          const beforeDrag = dragStartPositionsRef.current;
          dragStartPositionsRef.current = undefined;

          if (beforeDrag) {
            pushUndoSnapshot(beforeDrag);
          }

          persistLayout({
            ...layoutRef.current.nodePositions,
            [node.id]: node.position,
          });
        }}
        onNodesChange={onNodesChange}
        onPaneClick={() => onNodeSelect(undefined)}
        panOnDrag
        proOptions={{ hideAttribution: true }}
      >
        <Background
          color="var(--border)"
          gap={36}
          size={1}
          variant={BackgroundVariant.Lines}
        />
        <Controls position="bottom-right" showInteractive={false} />
        {showMiniMap ? (
          <MiniMap
            className="!bg-card/90 !shadow-sm"
            maskColor="rgba(15,17,23,0.62)"
            nodeBorderRadius={8}
            nodeColor={(node) => readNodeColor(node.data.kind)}
            pannable
            position="bottom-left"
            zoomable
          />
        ) : null}
      </ReactFlow>

      <div className="absolute inset-x-3 top-3 z-10 flex flex-col gap-2 md:inset-x-4 md:top-4">
        <div className="flex flex-col gap-2 xl:flex-row xl:items-start xl:justify-between">
          <section className="max-w-full rounded-lg border bg-background/86 p-2 shadow-sm backdrop-blur md:max-w-4xl">
            <div className="flex flex-wrap items-center gap-1">
              {typedNodeKinds.map((kind) => (
                <Button
                  className={cn(
                    "h-8 px-2 text-xs",
                    visibleKinds[kind] && kindButtonClass[kind]
                  )}
                  key={kind}
                  onClick={() => handleKindToggle(kind)}
                  type="button"
                  variant={visibleKinds[kind] ? "secondary" : "ghost"}
                >
                  {visibleKinds[kind] ? (
                    <Eye aria-hidden="true" />
                  ) : (
                    <EyeOff aria-hidden="true" />
                  )}
                  {visibleKindLabels[kind]}
                </Button>
              ))}
              <Button
                className="h-8 px-2 text-xs"
                disabled={!structuredResponse}
                onClick={() =>
                  setPriorityFilter((value) =>
                    value === "all" ? "high" : "all"
                  )
                }
                type="button"
                variant={priorityFilter === "high" ? "secondary" : "ghost"}
              >
                <Focus aria-hidden="true" />
                Alta prioridad
              </Button>
              <Button
                className="h-8 px-2 text-xs"
                disabled={!structuredResponse}
                onClick={() => setShowDependencies((value) => !value)}
                type="button"
                variant={showDependencies ? "secondary" : "ghost"}
              >
                <GitBranch aria-hidden="true" />
                Dependencias
              </Button>
              <Button
                className="h-8 px-2 text-xs"
                disabled={!structuredResponse}
                onClick={() => setCompactNodes((value) => !value)}
                type="button"
                variant={compactNodes ? "secondary" : "ghost"}
              >
                {compactNodes ? (
                  <Maximize2 aria-hidden="true" />
                ) : (
                  <Minimize2 aria-hidden="true" />
                )}
                {compactNodes ? "Expandir" : "Compactar"}
              </Button>
            </div>
          </section>

          <div className="flex gap-1 self-end rounded-lg border bg-background/86 p-1 shadow-sm backdrop-blur">
            <Button
              aria-label="Deshacer movimiento"
              disabled={undoStack.length === 0}
              onClick={handleUndo}
              size="icon"
              title="Deshacer último movimiento"
              type="button"
              variant="ghost"
            >
              <Undo2 aria-hidden="true" />
            </Button>
            <Button
              aria-label="Rehacer movimiento"
              disabled={redoStack.length === 0}
              onClick={handleRedo}
              size="icon"
              title="Rehacer movimiento"
              type="button"
              variant="ghost"
            >
              <Redo2 aria-hidden="true" />
            </Button>
            <Button
              aria-label="Reorganizar mapa"
              disabled={!structuredResponse}
              onClick={handleReorganize}
              size="sm"
              title="Restaurar organización automática"
              type="button"
              variant="ghost"
            >
              <LayoutGrid aria-hidden="true" data-icon="inline-start" />
              <span className="hidden xl:inline">Reorganizar</span>
            </Button>
            <Button
              aria-label="Recentrar mapa"
              disabled={!structuredResponse}
              onClick={handleRecenter}
              size="sm"
              title="Mostrar todo el mapa"
              type="button"
              variant="ghost"
            >
              <LocateFixed aria-hidden="true" data-icon="inline-start" />
              <span className="hidden xl:inline">Recentrar</span>
            </Button>
            <Button
              aria-label={
                showMiniMap ? "Ocultar minimapa" : "Mostrar minimapa"
              }
              onClick={() => setShowMiniMap((value) => !value)}
              size="icon"
              title={showMiniMap ? "Ocultar minimapa" : "Mostrar minimapa"}
              type="button"
              variant="ghost"
            >
              {showMiniMap ? (
                <EyeOff aria-hidden="true" data-icon="inline-start" />
              ) : (
                <Map aria-hidden="true" data-icon="inline-start" />
              )}
            </Button>
          </div>
        </div>

        {structuredResponse ? (
          <section className="hidden w-fit rounded-lg border bg-background/80 px-3 py-2 text-xs text-muted-foreground shadow-sm backdrop-blur md:block">
            {mapStats.highRisks} riesgos altos · {mapStats.highActions} acciones
            prioritarias · {filteredNodes.length - 1} nodos visibles
          </section>
        ) : null}
      </div>

      <div className="pointer-events-none absolute bottom-4 right-4 rounded-md border bg-background/80 px-3 py-2 text-xs text-muted-foreground shadow-sm backdrop-blur">
        {projectType === "app_product"
          ? "App / producto"
          : "Estrategia de negocio"}
        {structuredResponse ? " · Guardado automático" : ""}
      </div>
    </section>
  );
}

function applyNodePositions(
  nodes: Array<Node<StrategicNodeData>>,
  positions: MapLayoutState["nodePositions"]
) {
  return nodes.map((node) => ({
    ...node,
    position: positions[node.id] ?? node.position,
  }));
}

function clonePositions(positions: MapLayoutState["nodePositions"]) {
  return Object.fromEntries(
    Object.entries(positions).map(([id, position]) => [
      id,
      { ...position },
    ])
  );
}

function readNodePositions(
  nodes: Array<Node<StrategicNodeData>>,
  fallback: MapLayoutState["nodePositions"]
) {
  return {
    ...fallback,
    ...Object.fromEntries(
      nodes.map((node) => [node.id, { ...node.position }])
    ),
  };
}

function StrategicNode({ data, selected }: NodeProps<Node<StrategicNodeData>>) {
  const tone = mapTone[data.kind];
  const isCentral = data.kind === "central";
  const nodeStatus = data.reviewStatus ?? "pending";

  return (
    <article
      className={cn(
        "cursor-grab overflow-hidden rounded-xl border px-4 py-3 shadow-[0_18px_50px_rgba(0,0,0,0.22)] backdrop-blur-xl active:cursor-grabbing",
        "transition-transform duration-150",
        tone.bg,
        tone.border,
        data.isKey && "ring-2 ring-current/20",
        selected && "scale-[1.02] ring-2 ring-primary/45",
        data.compact
          ? isCentral
            ? "h-44 w-80"
            : "h-36 w-72"
          : isCentral
            ? "h-60 w-80"
            : "h-52 w-72",
        statusBorderClass[nodeStatus]
      )}
    >
      <Handle className="!size-2 !border-0 !bg-current" id="top-source" position={Position.Top} type="source" />
      <Handle className="!size-2 !border-0 !bg-current" id="top-target" position={Position.Top} type="target" />
      <Handle className="!size-2 !border-0 !bg-current" id="bottom-source" position={Position.Bottom} type="source" />
      <Handle className="!size-2 !border-0 !bg-current" id="bottom-target" position={Position.Bottom} type="target" />
      <Handle className="!size-2 !border-0 !bg-current" id="left-source" position={Position.Left} type="source" />
      <Handle className="!size-2 !border-0 !bg-current" id="left-target" position={Position.Left} type="target" />
      <Handle className="!size-2 !border-0 !bg-current" id="right-source" position={Position.Right} type="source" />
      <Handle className="!size-2 !border-0 !bg-current" id="right-target" position={Position.Right} type="target" />

      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className={cn("size-2.5 rounded-full", tone.dot)} />
          <p className={cn("truncate text-xs font-semibold uppercase", tone.accent)}>
            {tone.label}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {data.isKey ? (
            <span className="rounded-md border bg-background/55 px-2 py-0.5 text-[11px] font-medium uppercase text-foreground">
              Clave
            </span>
          ) : null}
          {data.priority ? (
            <span className="rounded-md border bg-background/55 px-2 py-0.5 text-[11px] font-medium uppercase text-muted-foreground">
              {priorityLabel[data.priority]}
            </span>
          ) : null}
        </div>
      </div>

      <h3
        className={cn(
          "mt-3 text-wrap break-words font-semibold leading-snug text-foreground",
          isCentral ? "text-lg" : "text-[15px]"
        )}
      >
        {data.label}
      </h3>
      {data.compact ? null : (
        <p className="mt-2 line-clamp-4 text-wrap break-words text-xs leading-5 text-muted-foreground">
          {data.description}
        </p>
      )}
      {data.kind !== "empty" ? (
        <div className="mt-3 flex items-center gap-2 text-[11px] font-medium uppercase text-muted-foreground">
          <span className={cn("size-1.5 rounded-full", statusDotClass[nodeStatus])} />
          {statusLabel[nodeStatus]}
        </div>
      ) : null}
    </article>
  );
}

const priorityLabel: Record<AINode["priority"], string> = {
  high: "Alta",
  low: "Baja",
  medium: "Media",
};

const statusLabel: Record<NodeReviewStatus, string> = {
  blocked: "Bloqueado",
  dismissed: "Descartado",
  pending: "Pendiente",
  validated: "Validado",
};

const statusDotClass: Record<NodeReviewStatus, string> = {
  blocked: "bg-risk",
  dismissed: "bg-muted-foreground",
  pending: "bg-hypothesis",
  validated: "bg-action",
};

const statusBorderClass: Record<NodeReviewStatus, string> = {
  blocked: "shadow-[0_0_0_1px_var(--risk),0_18px_50px_rgba(0,0,0,0.22)]",
  dismissed: "opacity-70",
  pending: "",
  validated: "shadow-[0_0_0_1px_var(--action),0_18px_50px_rgba(0,0,0,0.22)]",
};

const typedNodeKinds: VisibleKind[] = [
  "objective",
  "risk",
  "action",
  "hypothesis",
];

const kindButtonClass: Record<VisibleKind, string> = {
  action: "text-action",
  hypothesis: "text-hypothesis",
  objective: "text-objective",
  risk: "text-risk",
};

function filterNodes(
  nodes: Array<Node<StrategicNodeData>>,
  visibleKinds: Record<VisibleKind, boolean>,
  priorityFilter: PriorityFilter
) {
  return nodes.filter((node) => {
    const kind = node.data.kind;

    if (kind === "central" || kind === "empty") {
      return true;
    }

    if (!visibleKinds[kind]) {
      return false;
    }

    if (priorityFilter === "high" && node.data.priority !== "high") {
      return false;
    }

    return true;
  });
}

function buildStrategicNodes(input: {
  compact: boolean;
  hasDraft: boolean;
  nodeStatuses?: Record<string, NodeReviewStatus>;
  structuredResponse?: AIStructuredResponse;
}): Array<Node<StrategicNodeData>> {
  const { compact, hasDraft, nodeStatuses, structuredResponse } = input;

  if (!structuredResponse) {
    return [
      {
        data: {
          compact,
          description: hasDraft
            ? "Prepara el sparring para convertir la idea en un mapa interactivo."
            : "Escribe una idea y prepara el sparring para empezar.",
          isKey: false,
          kind: "empty",
          label: hasDraft ? "Idea preparada" : "Añade una idea para empezar",
        },
        id: "empty-state",
        position: { x: 0, y: 0 },
        type: "strategic",
      },
    ];
  }

  const positions = buildDeterministicNodePositions(structuredResponse);

  return [
    {
      data: {
        compact,
        description: structuredResponse.summary,
        isKey: true,
        kind: "central",
        label: structuredResponse.central_idea,
        reviewStatus: nodeStatuses?.central ?? "pending",
      },
      id: "central",
      position: positions.central,
      type: "strategic",
    },
    ...sectionNodes(
      "objective",
      structuredResponse.sections.objectives,
      positions,
      compact,
      nodeStatuses
    ),
    ...sectionNodes(
      "risk",
      structuredResponse.sections.risks,
      positions,
      compact,
      nodeStatuses
    ),
    ...sectionNodes(
      "action",
      structuredResponse.sections.actions,
      positions,
      compact,
      nodeStatuses
    ),
    ...sectionNodes(
      "hypothesis",
      structuredResponse.sections.hypotheses,
      positions,
      compact,
      nodeStatuses
    ),
  ];
}

function sectionNodes(
  kind: VisibleKind,
  items: AINode[],
  positions: MapLayoutState["nodePositions"],
  compact: boolean,
  nodeStatuses?: Record<string, NodeReviewStatus>
): Array<Node<StrategicNodeData>> {
  return items.map((item, index) => {
    const id = `${kind}-${index}`;

    return {
      data: {
        compact,
        description: item.description,
        isKey:
          item.priority === "high" &&
          (kind === "risk" || kind === "action"),
        kind,
        label: item.label,
        priority: item.priority,
        reviewStatus: nodeStatuses?.[id] ?? "pending",
      },
      id,
      position: positions[id],
      type: "strategic",
    };
  });
}

function buildStrategicEdges(input: {
  showDependencies: boolean;
  structuredResponse?: AIStructuredResponse;
  visibleKinds: Record<VisibleKind, boolean>;
  visibleNodeIds: Set<string>;
}): Array<Edge> {
  const {
    showDependencies,
    structuredResponse,
    visibleKinds,
    visibleNodeIds,
  } = input;

  if (!structuredResponse) {
    return [];
  }

  return [
    ...sectionEdges(
      "objective",
      structuredResponse.sections.objectives.length,
      visibleKinds,
      visibleNodeIds
    ),
    ...sectionEdges(
      "risk",
      structuredResponse.sections.risks.length,
      visibleKinds,
      visibleNodeIds
    ),
    ...sectionEdges(
      "action",
      structuredResponse.sections.actions.length,
      visibleKinds,
      visibleNodeIds
    ),
    ...sectionEdges(
      "hypothesis",
      structuredResponse.sections.hypotheses.length,
      visibleKinds,
      visibleNodeIds
    ),
    ...(showDependencies
      ? dependencyEdges(structuredResponse, visibleNodeIds)
      : []),
  ];
}

function sectionEdges(
  kind: VisibleKind,
  count: number,
  visibleKinds: Record<VisibleKind, boolean>,
  visibleNodeIds: Set<string>
) {
  const handles = edgeHandles[kind];

  if (!visibleKinds[kind]) {
    return [];
  }

  return Array.from({ length: count }, (_, index) => {
    const target = `${kind}-${index}`;

    if (!visibleNodeIds.has(target)) {
      return undefined;
    }

    return {
      animated: kind === "action",
      id: `edge-central-${kind}-${index}`,
      markerEnd: {
        color: readNodeColor(kind),
        type: MarkerType.ArrowClosed,
      },
      source: "central",
      sourceHandle: handles.source,
      style: {
        stroke: readNodeColor(kind),
        strokeWidth: 2.6,
      },
      target,
      targetHandle: handles.target,
      type: "smoothstep",
    } satisfies Edge;
  }).filter(Boolean) as Edge[];
}

function dependencyEdges(
  structuredResponse: AIStructuredResponse,
  visibleNodeIds: Set<string>
) {
  const risks = structuredResponse.sections.risks;
  const hypotheses = structuredResponse.sections.hypotheses;

  return structuredResponse.sections.actions.flatMap((_, index) => {
    const source = `action-${index}`;
    const edges: Edge[] = [];

    if (!visibleNodeIds.has(source)) {
      return edges;
    }

    if (risks.length > 0) {
      const riskTarget = `risk-${index % risks.length}`;

      if (visibleNodeIds.has(riskTarget)) {
        edges.push(createDependencyEdge(source, riskTarget, "risk", index));
      }
    }

    if (hypotheses.length > 0) {
      const hypothesisTarget = `hypothesis-${index % hypotheses.length}`;

      if (visibleNodeIds.has(hypothesisTarget)) {
        edges.push(
          createDependencyEdge(source, hypothesisTarget, "hypothesis", index)
        );
      }
    }

    return edges;
  });
}

function createDependencyEdge(
  source: string,
  target: string,
  tone: Extract<VisibleKind, "risk" | "hypothesis">,
  index: number
): Edge {
  return {
    animated: false,
    id: `dependency-${source}-${target}-${index}`,
    markerEnd: {
      color: readNodeColor(tone),
      type: MarkerType.ArrowClosed,
    },
    source,
    sourceHandle: tone === "risk" ? "left-source" : "bottom-source",
    style: {
      opacity: 0.72,
      stroke: readNodeColor(tone),
      strokeDasharray: "7 7",
      strokeWidth: 2.2,
    },
    target,
    targetHandle: tone === "risk" ? "right-target" : "top-target",
    type: "smoothstep",
  };
}

const edgeHandles: Record<
  VisibleKind,
  { source: string; target: string }
> = {
  action: { source: "right-source", target: "left-target" },
  hypothesis: { source: "bottom-source", target: "top-target" },
  objective: { source: "top-source", target: "bottom-target" },
  risk: { source: "left-source", target: "right-target" },
};

function calculateMapStats(structuredResponse?: AIStructuredResponse) {
  if (!structuredResponse) {
    return {
      highActions: 0,
      highRisks: 0,
    };
  }

  return {
    highActions: structuredResponse.sections.actions.filter(
      (item) => item.priority === "high"
    ).length,
    highRisks: structuredResponse.sections.risks.filter(
      (item) => item.priority === "high"
    ).length,
  };
}

function readNodeColor(kind: unknown) {
  if (kind === "objective") {
    return "var(--objective)";
  }

  if (kind === "risk") {
    return "var(--risk)";
  }

  if (kind === "action") {
    return "var(--action)";
  }

  if (kind === "hypothesis") {
    return "var(--hypothesis)";
  }

  return "var(--primary)";
}
