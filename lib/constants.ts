import type { AIModelId, ProjectType } from "@/types";

export const PROJECT_TYPE_OPTIONS: Array<{
  value: ProjectType;
  label: string;
  description: string;
}> = [
  {
    value: "app_product",
    label: "App / producto",
    description: "Producto digital, herramienta, SaaS o experiencia app.",
  },
  {
    value: "business_strategy",
    label: "Estrategia de negocio",
    description: "Oferta, mercado, posicionamiento o modelo comercial.",
  },
];

export const NODE_TYPE_LABELS = {
  central: "Idea central",
  objective: "Objetivos",
  risk: "Riesgos",
  action: "Acciones",
  hypothesis: "Hipótesis",
} as const;

export const AI_MODEL_OPTIONS: Array<{
  value: AIModelId;
  label: string;
  description: string;
  provider: "Google" | "OpenAI";
}> = [
  {
    value: "gemini-2.5-flash",
    label: "Gemini 2.5 Flash",
    description: "Opción gratuita/barata más estable para pruebas del MVP.",
    provider: "Google",
  },
  {
    value: "gemini-2.5-flash-lite",
    label: "Gemini 2.5 Flash-Lite",
    description: "Más rápida y económica; útil para pruebas frecuentes.",
    provider: "Google",
  },
  {
    value: "gemini-3.5-flash",
    label: "Gemini 3.5 Flash",
    description: "Más potente, pero puede saturarse en horas de alta demanda.",
    provider: "Google",
  },
  {
    value: "gpt-5.4-mini",
    label: "GPT-5.4 mini",
    description: "Opción recomendada por defecto: buena calidad y coste bajo.",
    provider: "OpenAI",
  },
  {
    value: "gpt-5.5",
    label: "GPT-5.5",
    description: "Modo premium para comparar máxima calidad estratégica.",
    provider: "OpenAI",
  },
];
