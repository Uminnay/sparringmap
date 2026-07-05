import { NODE_TYPE_LABELS } from "@/lib/constants";
import type {
  AINode,
  AIStructuredResponse,
  NodeReviewStatus,
  NodeType,
  SparringProject,
} from "@/types";

interface PrintableVisualMapProps {
  project?: SparringProject;
}

interface VisualNode {
  description: string;
  descriptionLines: string[];
  height: number;
  id: string;
  kind: NodeType;
  label: string;
  labelLines: string[];
  priority?: AINode["priority"];
  reviewStatus: NodeReviewStatus;
  width: number;
  x: number;
  y: number;
}

const nodeWidth = 430;
const centralWidth = 520;
const padding = 180;
const cardGap = 42;

export function PrintableVisualMap({ project }: PrintableVisualMapProps) {
  const response = project?.structuredResponse;

  if (!response) {
    return null;
  }

  const nodes = buildVisualNodes(project);
  const centralNode = nodes.find((node) => node.kind === "central") ?? nodes[0];
  const bounds = getBounds(nodes);

  return (
    <article className="print-visual-map" aria-label="Mapa visual imprimible">
      <svg
        className="print-visual-map-svg"
        role="img"
        viewBox={`${bounds.x} ${bounds.y} ${bounds.width} ${bounds.height}`}
      >
        <defs>
          {visualKinds.map((kind) => (
            <marker
              id={`print-arrow-${kind}`}
              key={kind}
              markerHeight="6"
              markerWidth="6"
              orient="auto"
              refX="5.2"
              refY="3"
              viewBox="0 0 6 6"
            >
              <path
                d="M0,0 L6,3 L0,6 Z"
                fill={kindColor[kind]}
                fillOpacity="0.34"
              />
            </marker>
          ))}
        </defs>
        <rect
          fill="#11151d"
          height={bounds.height}
          rx="30"
          width={bounds.width}
          x={bounds.x}
          y={bounds.y}
        />
        <GridPattern bounds={bounds} />
        <g aria-hidden="true">
          {nodes
            .filter((node) => node.kind !== "central")
            .map((node) => (
              <VisualEdge centralNode={centralNode} key={`edge-${node.id}`} node={node} />
            ))}
        </g>
        <g>
          {nodes.map((node) => (
            <VisualCard key={node.id} node={node} />
          ))}
        </g>
      </svg>
    </article>
  );
}

function buildVisualNodes(project: SparringProject): VisualNode[] {
  const response = project.structuredResponse as AIStructuredResponse;
  const nodeStatuses = project.mapLayout?.nodeStatuses ?? {};
  const centralNode = createVisualNode({
    description: response.summary,
    id: "central",
    kind: "central",
    label: response.central_idea,
    reviewStatus: nodeStatuses.central ?? "pending",
    width: centralWidth,
  });
  const objectiveNodes = sectionVisualNodes(
    "objective",
    response.sections.objectives,
    nodeStatuses
  );
  const riskNodes = sectionVisualNodes("risk", response.sections.risks, nodeStatuses);
  const actionNodes = sectionVisualNodes(
    "action",
    response.sections.actions,
    nodeStatuses
  );
  const hypothesisNodes = sectionVisualNodes(
    "hypothesis",
    response.sections.hypotheses,
    nodeStatuses
  );
  const layout = createPrintLayout(riskNodes, actionNodes);

  return [
    {
      ...centralNode,
      x: -centralWidth / 2,
      y: -centralNode.height / 2,
    },
    ...positionSectionNodes("objective", objectiveNodes, layout),
    ...positionSectionNodes("risk", riskNodes, layout),
    ...positionSectionNodes("action", actionNodes, layout),
    ...positionSectionNodes("hypothesis", hypothesisNodes, layout),
  ];
}

function sectionVisualNodes(
  kind: Exclude<NodeType, "central">,
  items: AINode[],
  nodeStatuses: Record<string, NodeReviewStatus>
) {
  return items.map((item, index) =>
    createVisualNode({
      description: item.description,
      id: `${kind}-${index}`,
      kind,
      label: item.label,
      priority: item.priority,
      reviewStatus: nodeStatuses[`${kind}-${index}`] ?? "pending",
      width: nodeWidth,
    })
  );
}

function positionSectionNodes(
  kind: Exclude<NodeType, "central">,
  nodes: Array<Omit<VisualNode, "x" | "y">>,
  layout: PrintLayout
) {
  return nodes.map((node, index) => {
    const position = calculatePrintPosition(kind, index, nodes, layout);

    return {
      ...node,
      x: position.x,
      y: position.y,
    };
  });
}

function createVisualNode({
  description,
  id,
  kind,
  label,
  priority,
  reviewStatus,
  width,
}: {
  description: string;
  id: string;
  kind: NodeType;
  label: string;
  priority?: AINode["priority"];
  reviewStatus: NodeReviewStatus;
  width: number;
}): Omit<VisualNode, "x" | "y"> {
  const labelLines = wrapText(label, kind === "central" ? 42 : 36);
  const descriptionLines = wrapText(description, kind === "central" ? 54 : 46);
  const height =
    78 + labelLines.length * 24 + descriptionLines.length * 19 + 38;

  return {
    description,
    descriptionLines,
    height,
    id,
    kind,
    label,
    labelLines,
    priority,
    reviewStatus,
    width,
  };
}

interface PrintLayout {
  bottomY: number;
  sideX: number;
  topY: number;
}

function createPrintLayout(
  riskNodes: Array<Pick<VisualNode, "height">>,
  actionNodes: Array<Pick<VisualNode, "height">>
): PrintLayout {
  const maxSideExtent =
    Math.max(stackedHeight(riskNodes), stackedHeight(actionNodes)) / 2;
  const topY = -Math.max(900, maxSideExtent + 340);

  return {
    bottomY: Math.abs(topY),
    sideX: 760,
    topY,
  };
}

function calculatePrintPosition(
  kind: Exclude<NodeType, "central">,
  index: number,
  nodes: Array<Omit<VisualNode, "x" | "y">>,
  layout: PrintLayout
) {
  const horizontalGap = 470;
  const centeredIndex = index - (nodes.length - 1) / 2;

  if (kind === "objective") {
    return { x: centeredIndex * horizontalGap - nodeWidth / 2, y: layout.topY };
  }

  if (kind === "risk") {
    return {
      x: -layout.sideX - nodeWidth,
      y: stackedY(nodes, index),
    };
  }

  if (kind === "action") {
    return { x: layout.sideX, y: stackedY(nodes, index) };
  }

  return { x: centeredIndex * horizontalGap - nodeWidth / 2, y: layout.bottomY };
}

function stackedY(nodes: Array<Pick<VisualNode, "height">>, index: number) {
  const totalHeight = stackedHeight(nodes);
  const previousHeight =
    nodes.slice(0, index).reduce((sum, node) => sum + node.height, 0) +
    index * cardGap;

  return -totalHeight / 2 + previousHeight;
}

function stackedHeight(nodes: Array<Pick<VisualNode, "height">>) {
  return (
    nodes.reduce((sum, node) => sum + node.height, 0) +
    Math.max(nodes.length - 1, 0) * cardGap
  );
}

function getBounds(nodes: VisualNode[]) {
  const minX = Math.min(...nodes.map((node) => node.x)) - padding;
  const minY = Math.min(...nodes.map((node) => node.y)) - padding;
  const maxX = Math.max(...nodes.map((node) => node.x + node.width)) + padding;
  const maxY = Math.max(...nodes.map((node) => node.y + node.height)) + padding;

  return {
    height: maxY - minY,
    width: maxX - minX,
    x: minX,
    y: minY,
  };
}

function GridPattern({
  bounds,
}: {
  bounds: { height: number; width: number; x: number; y: number };
}) {
  const verticalLines = Array.from(
    { length: Math.ceil(bounds.width / 52) + 1 },
    (_, index) => bounds.x + index * 52
  );
  const horizontalLines = Array.from(
    { length: Math.ceil(bounds.height / 52) + 1 },
    (_, index) => bounds.y + index * 52
  );

  return (
    <g opacity="0.28">
      {verticalLines.map((x) => (
        <line
          key={`v-${x}`}
          stroke="#334155"
          strokeWidth="1"
          x1={x}
          x2={x}
          y1={bounds.y}
          y2={bounds.y + bounds.height}
        />
      ))}
      {horizontalLines.map((y) => (
        <line
          key={`h-${y}`}
          stroke="#334155"
          strokeWidth="1"
          x1={bounds.x}
          x2={bounds.x + bounds.width}
          y1={y}
          y2={y}
        />
      ))}
    </g>
  );
}

function VisualEdge({
  centralNode,
  node,
}: {
  centralNode: VisualNode;
  node: VisualNode;
}) {
  const central = nodeCenter(centralNode);
  const target = nodeCenter(node);
  const start = edgePointOnRect(centralNode, target);
  const end = edgePointOnRect(node, central);

  return (
    <line
      markerEnd={`url(#print-arrow-${node.kind})`}
      stroke={kindColor[node.kind]}
      strokeLinecap="round"
      strokeOpacity="0.2"
      strokeWidth="3"
      x1={start.x}
      x2={end.x}
      y1={start.y}
      y2={end.y}
    />
  );
}

function VisualCard({ node }: { node: VisualNode }) {
  const titleStartY = node.y + 62;
  const descriptionStartY = titleStartY + node.labelLines.length * 24 + 14;
  const statusY = node.y + node.height - 24;

  return (
    <g>
      <rect
        fill={kindFill[node.kind]}
        height={node.height}
        rx="20"
        stroke={kindStroke[node.kind]}
        strokeOpacity="0.92"
        strokeWidth="2.5"
        width={node.width}
        x={node.x}
        y={node.y}
      />
      <text
        fill={kindColor[node.kind]}
        fontFamily="Inter, Arial, sans-serif"
        fontSize="16"
        fontWeight="800"
        letterSpacing="0.6"
        textAnchor="start"
        x={node.x + 22}
        y={node.y + 32}
      >
        {kindLabel[node.kind].toUpperCase()}
      </text>
      {node.priority ? (
        <text
          fill="#e5e7eb"
          fontFamily="Inter, Arial, sans-serif"
          fontSize="14"
          fontWeight="800"
          textAnchor="end"
          x={node.x + node.width - 22}
          y={node.y + 32}
        >
        {priorityLabel[node.priority].toUpperCase()}
        </text>
      ) : null}
      <text
        fill="#ffffff"
        fontFamily="Inter, Arial, sans-serif"
        fontSize={node.kind === "central" ? "21" : "20"}
        fontWeight="800"
        textAnchor="start"
        x={node.x + 22}
        y={titleStartY}
      >
        {node.labelLines.map((line, index) => (
          <tspan dy={index === 0 ? 0 : 24} key={`${node.id}-label-${index}`} x={node.x + 22}>
            {line}
          </tspan>
        ))}
      </text>
      <text
        fill="#cbd5e1"
        fontFamily="Inter, Arial, sans-serif"
        fontSize="16"
        fontWeight="500"
        textAnchor="start"
        x={node.x + 22}
        y={descriptionStartY}
      >
        {node.descriptionLines.map((line, index) => (
          <tspan
            dy={index === 0 ? 0 : 19}
            key={`${node.id}-description-${index}`}
            x={node.x + 22}
          >
            {line}
          </tspan>
        ))}
      </text>
      <circle
        cx={node.x + 28}
        cy={statusY - 5}
        fill={statusColor[node.reviewStatus]}
        r="5"
      />
      <text
        fill="#e5e7eb"
        fontFamily="Inter, Arial, sans-serif"
        fontSize="13"
        fontWeight="800"
        letterSpacing="0.5"
        textAnchor="start"
        x={node.x + 42}
        y={statusY}
      >
        {nodeStatusLabel[node.reviewStatus].toUpperCase()}
      </text>
    </g>
  );
}

function nodeCenter(node: VisualNode) {
  return {
    x: node.x + node.width / 2,
    y: node.y + node.height / 2,
  };
}

function edgePointOnRect(rect: VisualNode, toward: { x: number; y: number }) {
  const center = nodeCenter(rect);
  const dx = toward.x - center.x;
  const dy = toward.y - center.y;
  const scale = Math.max(
    Math.abs(dx) / (rect.width / 2),
    Math.abs(dy) / (rect.height / 2),
    1
  );

  return {
    x: center.x + dx / scale,
    y: center.y + dy / scale,
  };
}

function wrapText(text: string, maxCharacters: number) {
  const words = text.replace(/\s+/g, " ").trim().split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const candidate = currentLine ? `${currentLine} ${word}` : word;

    if (candidate.length <= maxCharacters) {
      currentLine = candidate;
      continue;
    }

    if (currentLine) {
      lines.push(currentLine);
    }

    currentLine = word;
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines.length > 0 ? lines : [""];
}

const visualKinds: Array<Exclude<NodeType, "central">> = [
  "objective",
  "risk",
  "action",
  "hypothesis",
];

const kindLabel: Record<NodeType, string> = {
  action: NODE_TYPE_LABELS.action,
  central: NODE_TYPE_LABELS.central,
  hypothesis: NODE_TYPE_LABELS.hypothesis,
  objective: NODE_TYPE_LABELS.objective,
  risk: NODE_TYPE_LABELS.risk,
};

const kindColor: Record<NodeType, string> = {
  action: "#10b981",
  central: "#a78bfa",
  hypothesis: "#f59e0b",
  objective: "#60a5fa",
  risk: "#f87171",
};

const kindFill: Record<NodeType, string> = {
  action: "#14372d",
  central: "#3a275c",
  hypothesis: "#463014",
  objective: "#172d54",
  risk: "#411a1e",
};

const kindStroke: Record<NodeType, string> = {
  action: "#10b981",
  central: "#8b5cf6",
  hypothesis: "#f59e0b",
  objective: "#3b82f6",
  risk: "#ef4444",
};

const priorityLabel: Record<AINode["priority"], string> = {
  high: "Alta",
  low: "Baja",
  medium: "Media",
};

const nodeStatusLabel: Record<NodeReviewStatus, string> = {
  blocked: "Bloqueado",
  dismissed: "Descartado",
  pending: "Pendiente",
  validated: "Validado",
};

const statusColor: Record<NodeReviewStatus, string> = {
  blocked: "#ef4444",
  dismissed: "#94a3b8",
  pending: "#f59e0b",
  validated: "#10b981",
};
