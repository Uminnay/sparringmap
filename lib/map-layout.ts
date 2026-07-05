import type {
  AIStructuredResponse,
  MapPosition,
  NodeType,
} from "@/types";

export function buildDeterministicNodePositions(
  structuredResponse: AIStructuredResponse
): Record<string, MapPosition> {
  return {
    central: { x: -160, y: -104 },
    ...sectionPositions(
      "objective",
      structuredResponse.sections.objectives.length
    ),
    ...sectionPositions("risk", structuredResponse.sections.risks.length),
    ...sectionPositions("action", structuredResponse.sections.actions.length),
    ...sectionPositions(
      "hypothesis",
      structuredResponse.sections.hypotheses.length
    ),
  };
}

function sectionPositions(
  kind: Exclude<NodeType, "central">,
  count: number
) {
  return Object.fromEntries(
    Array.from({ length: count }, (_, index) => [
      `${kind}-${index}`,
      calculatePosition(kind, index, count),
    ])
  );
}

function calculatePosition(
  kind: Exclude<NodeType, "central">,
  index: number,
  count: number
) {
  const horizontalOffset = (index - (count - 1) / 2) * 340;
  const verticalOffset = (index - (count - 1) / 2) * 260;

  if (kind === "objective") {
    return { x: -144 + horizontalOffset, y: -680 };
  }

  if (kind === "risk") {
    return { x: -980, y: -88 + verticalOffset };
  }

  if (kind === "action") {
    return { x: 700, y: -88 + verticalOffset };
  }

  return { x: -144 + horizontalOffset, y: 680 };
}
