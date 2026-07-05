import type {
  AIStructuredResponse,
  MapPosition,
  NodeType,
} from "@/types";

export function buildDeterministicNodePositions(
  structuredResponse: AIStructuredResponse
): Record<string, MapPosition> {
  return {
    central: { x: -150, y: -96 },
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
  const horizontalOffset = (index - (count - 1) / 2) * 300;
  const verticalOffset = (index - (count - 1) / 2) * 220;

  if (kind === "objective") {
    return { x: -144 + horizontalOffset, y: -560 };
  }

  if (kind === "risk") {
    return { x: -760, y: -88 + verticalOffset };
  }

  if (kind === "action") {
    return { x: 520, y: -88 + verticalOffset };
  }

  return { x: -144 + horizontalOffset, y: 560 };
}
