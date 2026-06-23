import type { ProjectType } from "@/types";

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
