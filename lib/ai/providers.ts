import { getAIModelConfig } from "@/lib/ai/models";
import { SPARRING_SYSTEM_PROMPT } from "@/lib/ai/prompts";
import type { AIModelId } from "@/types";

interface GenerateJSONInput {
  jsonSchema: unknown;
  modelId: AIModelId;
  prompt: string;
  schemaName: string;
}

export interface RawAIResult {
  rawResponse: string;
  value: unknown;
}

export class AIProviderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AIProviderError";
  }
}

export async function generateStructuredJSON({
  jsonSchema,
  modelId,
  prompt,
  schemaName,
}: GenerateJSONInput): Promise<RawAIResult> {
  const config = getAIModelConfig(modelId);
  const apiKey = process.env[config.envKey];

  if (!apiKey) {
    throw new AIProviderError(
      `Falta configurar ${config.envKey} para usar ${modelId}.`
    );
  }

  if (config.provider === "openai") {
    return generateOpenAIJSON({
      apiKey,
      jsonSchema,
      modelId,
      prompt,
      schemaName,
    });
  }

  return generateGeminiJSON({
    apiKey,
    jsonSchema,
    modelId,
    prompt,
  });
}

async function generateOpenAIJSON({
  apiKey,
  jsonSchema,
  modelId,
  prompt,
  schemaName,
}: GenerateJSONInput & { apiKey: string }) {
  const response = await fetch("https://api.openai.com/v1/responses", {
    body: JSON.stringify({
      input: [
        { role: "system", content: SPARRING_SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
      model: modelId,
      store: false,
      text: {
        format: {
          name: schemaName,
          schema: jsonSchema,
          strict: true,
          type: "json_schema",
        },
      },
    }),
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  const payload: unknown = await response.json();

  if (!response.ok) {
    throw new AIProviderError(readProviderError(payload, "OpenAI"));
  }

  const rawResponse = readOpenAIResponseText(payload);

  return {
    rawResponse,
    value: parseJSONText(rawResponse),
  };
}

async function generateGeminiJSON({
  apiKey,
  jsonSchema,
  modelId,
  prompt,
}: Omit<GenerateJSONInput, "schemaName"> & { apiKey: string }) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`,
    {
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: sanitizeSchemaForGemini(jsonSchema),
        },
        systemInstruction: {
          parts: [{ text: SPARRING_SYSTEM_PROMPT }],
        },
      }),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    }
  );

  const payload: unknown = await response.json();

  if (!response.ok) {
    throw new AIProviderError(readProviderError(payload, "Gemini"));
  }

  const rawResponse = readGeminiContent(payload);

  return {
    rawResponse,
    value: parseJSONText(rawResponse),
  };
}

function parseJSONText(rawResponse: string) {
  try {
    return JSON.parse(rawResponse);
  } catch {
    throw new AIProviderError("La IA no ha devuelto JSON parseable.");
  }
}

function sanitizeSchemaForGemini(schema: unknown): unknown {
  if (Array.isArray(schema)) {
    return schema.map((item) => sanitizeSchemaForGemini(item));
  }

  if (!isRecord(schema)) {
    return schema;
  }

  return Object.fromEntries(
    Object.entries(schema)
      .filter(([key]) => key !== "additionalProperties")
      .map(([key, value]) => [key, sanitizeSchemaForGemini(value)])
  );
}

function readOpenAIResponseText(payload: unknown) {
  const outputText = getPath(payload, ["output_text"]);

  if (typeof outputText === "string" && outputText.trim()) {
    return outputText;
  }

  const output = getPath(payload, ["output"]);

  if (!Array.isArray(output)) {
    throw new AIProviderError("OpenAI no ha devuelto contenido textual.");
  }

  const text = output
    .flatMap((item) => {
      if (!isRecord(item) || !Array.isArray(item.content)) {
        return [];
      }

      return item.content.map((contentItem) =>
        isRecord(contentItem) && typeof contentItem.text === "string"
          ? contentItem.text
          : ""
      );
    })
    .join("")
    .trim();

  if (!text) {
    throw new AIProviderError("OpenAI ha devuelto una respuesta vacía.");
  }

  return text;
}

function readGeminiContent(payload: unknown) {
  const parts = getPath(payload, ["candidates", 0, "content", "parts"]);

  if (!Array.isArray(parts)) {
    throw new AIProviderError("Gemini no ha devuelto contenido textual.");
  }

  const text = parts
    .map((part) => (isRecord(part) && typeof part.text === "string" ? part.text : ""))
    .join("")
    .trim();

  if (!text) {
    throw new AIProviderError("Gemini ha devuelto una respuesta vacía.");
  }

  return text;
}

function readProviderError(payload: unknown, provider: string) {
  const message =
    getPath(payload, ["error", "message"]) ??
    getPath(payload, ["error", "status"]) ??
    getPath(payload, ["message"]);

  if (typeof message === "string") {
    return `${provider}: ${message}`;
  }

  return `${provider}: la llamada a IA ha fallado.`;
}

function getPath(source: unknown, path: Array<string | number>): unknown {
  let current = source;

  for (const segment of path) {
    if (typeof segment === "number") {
      if (!Array.isArray(current)) {
        return undefined;
      }
      current = current[segment];
    } else {
      if (!isRecord(current)) {
        return undefined;
      }
      current = current[segment];
    }
  }

  return current;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
