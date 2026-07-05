import type { AIGenerationMetrics, AIModelId } from "@/types";

const costLabels: Record<AIModelId, string> = {
  "gemini-2.5-flash": "coste bajo o cubierto por cuota gratuita",
  "gemini-2.5-flash-lite": "coste muy bajo o cubierto por cuota gratuita",
  "gemini-3.5-flash": "coste medio; revisar disponibilidad y cuotas",
  "gpt-5.4-mini": "coste bajo-medio; revisar precio vigente",
  "gpt-5.5": "coste alto; usar para comparación premium",
};

export function createGenerationMetrics(input: {
  attempts: number;
  generatedAt?: string;
  latencyMs: number;
  modelId: AIModelId;
  prompt: string;
  rawResponse?: string;
}): AIGenerationMetrics {
  return {
    attempts: input.attempts,
    estimatedCostLabel: costLabels[input.modelId],
    estimatedInputTokens: estimateTokenCount(input.prompt),
    estimatedOutputTokens: estimateTokenCount(input.rawResponse ?? ""),
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    latencyMs: Math.max(0, Math.round(input.latencyMs)),
    modelId: input.modelId,
  };
}

export function estimateTokenCount(value: string) {
  const normalized = value.trim();

  if (!normalized) {
    return 0;
  }

  return Math.max(1, Math.ceil(normalized.length / 4));
}
