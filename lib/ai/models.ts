import type { AIModelId } from "@/types";

export type AIProviderId = "gemini" | "openai";

export interface AIModelConfig {
  envKey: "GEMINI_API_KEY" | "OPENAI_API_KEY";
  id: AIModelId;
  provider: AIProviderId;
}

export const AI_MODEL_CONFIGS: Record<AIModelId, AIModelConfig> = {
  "gemini-2.5-flash": {
    envKey: "GEMINI_API_KEY",
    id: "gemini-2.5-flash",
    provider: "gemini",
  },
  "gemini-2.5-flash-lite": {
    envKey: "GEMINI_API_KEY",
    id: "gemini-2.5-flash-lite",
    provider: "gemini",
  },
  "gemini-3.5-flash": {
    envKey: "GEMINI_API_KEY",
    id: "gemini-3.5-flash",
    provider: "gemini",
  },
  "gpt-5.4-mini": {
    envKey: "OPENAI_API_KEY",
    id: "gpt-5.4-mini",
    provider: "openai",
  },
  "gpt-5.5": {
    envKey: "OPENAI_API_KEY",
    id: "gpt-5.5",
    provider: "openai",
  },
};

export function getAIModelConfig(modelId: AIModelId) {
  return AI_MODEL_CONFIGS[modelId];
}
