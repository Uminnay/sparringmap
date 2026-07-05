import type { ProjectType } from "@/types";

export interface StrategicEvaluationCase {
  expectedPressurePoints: string[];
  id: string;
  input: string;
  notes: string;
  type: ProjectType;
}

export const strategicEvaluationCases: StrategicEvaluationCase[] = [
  {
    id: "app-adhd-study-companion",
    input:
      "Una app para estudiantes con TDAH que convierte apuntes desordenados en sesiones cortas de estudio con recordatorios y recompensas.",
    type: "app_product",
    notes: "Debe distinguir foco real, retención, hábitos y riesgo de app genérica.",
    expectedPressurePoints: ["retención", "evidencia", "diferenciación"],
  },
  {
    id: "app-local-food-leftovers",
    input:
      "Marketplace local para vender comida sobrante de restaurantes de barrio al final del día con recogida rápida.",
    type: "app_product",
    notes: "Debe detectar operaciones, oferta suficiente, margen y seguridad alimentaria.",
    expectedPressurePoints: ["liquidez", "operaciones", "regulación"],
  },
  {
    id: "app-ai-legal-summary",
    input:
      "Herramienta que resume contratos legales para autónomos y les avisa de cláusulas peligrosas.",
    type: "app_product",
    notes: "Debe separar utilidad de riesgo legal y responsabilidad profesional.",
    expectedPressurePoints: ["responsabilidad", "precisión", "confianza"],
  },
  {
    id: "app-vr-fitness-seniors",
    input:
      "Entrenamientos de realidad virtual para personas mayores que quieren mejorar equilibrio y movilidad desde casa.",
    type: "app_product",
    notes: "Debe cuestionar accesibilidad, hardware, seguridad y adopción.",
    expectedPressurePoints: ["seguridad", "hardware", "adopción"],
  },
  {
    id: "physical-microbiome-tampon",
    input:
      "Un tampón menstrual que incorpore principios activos para favorecer la microbiota vaginal durante el periodo.",
    type: "business_strategy",
    notes: "Caso de alto riesgo: debe insistir en ciencia, regulación y seguridad.",
    expectedPressurePoints: ["evidencia clínica", "regulación", "seguridad"],
  },
  {
    id: "physical-smart-bottle",
    input:
      "Botella reutilizable inteligente que analiza la calidad del agua y recomienda filtros o minerales.",
    type: "app_product",
    notes: "Debe detectar coste hardware, exactitud de sensores y propuesta de valor.",
    expectedPressurePoints: ["sensores", "coste", "valor"],
  },
  {
    id: "physical-biodegradable-packaging",
    input:
      "Packaging biodegradable premium para marcas de cosmética natural que quieren reducir plástico sin perder estética.",
    type: "business_strategy",
    notes: "Debe explorar margen, certificaciones, supply chain y diferenciación.",
    expectedPressurePoints: ["certificación", "margen", "suministro"],
  },
  {
    id: "saas-customer-support",
    input:
      "SaaS para pequeñas tiendas online que clasifica tickets, propone respuestas y detecta problemas repetidos de producto.",
    type: "app_product",
    notes: "Debe ir más allá de chatbot y priorizar integración, ROI y datos.",
    expectedPressurePoints: ["integraciones", "ROI", "datos"],
  },
  {
    id: "saas-construction-budget",
    input:
      "SaaS para constructoras pequeñas que predice desviaciones de presupuesto usando facturas, partes de obra y compras.",
    type: "app_product",
    notes: "Debe cuestionar calidad de datos y adopción en un sector poco digitalizado.",
    expectedPressurePoints: ["datos", "adopción", "predicción"],
  },
  {
    id: "saas-creator-finance",
    input:
      "Panel financiero para creadores que une ingresos de plataformas, gastos y previsión de impuestos.",
    type: "app_product",
    notes: "Debe detectar integraciones, sensibilidad fiscal y nicho rentable.",
    expectedPressurePoints: ["integraciones", "fiscalidad", "nicho"],
  },
  {
    id: "business-boutique-gym",
    input:
      "Abrir un gimnasio boutique de fuerza para mujeres de 35 a 55 años en una ciudad mediana.",
    type: "business_strategy",
    notes: "Debe priorizar localización, demanda, pricing, ocupación y CAC local.",
    expectedPressurePoints: ["ubicación", "ocupación", "pricing"],
  },
  {
    id: "business-b2b-workshops",
    input:
      "Vender talleres de IA aplicada a equipos comerciales de pymes tradicionales.",
    type: "business_strategy",
    notes: "Debe distinguir formación genérica frente a resultado comercial medible.",
    expectedPressurePoints: ["resultado", "venta B2B", "diferenciación"],
  },
  {
    id: "business-premium-coffee",
    input:
      "Marca de café premium por suscripción para oficinas pequeñas que quieren mejorar la experiencia del equipo.",
    type: "business_strategy",
    notes: "Debe cuestionar margen, logística recurrente y disposición a pagar.",
    expectedPressurePoints: ["margen", "logística", "retención"],
  },
  {
    id: "ambiguous-community-platform",
    input:
      "Una plataforma para que la gente encuentre personas con intereses similares y cree proyectos juntos.",
    type: "app_product",
    notes: "Idea vaga: debe pedir foco, caso de uso y mecanismo de confianza.",
    expectedPressurePoints: ["foco", "liquidez", "confianza"],
  },
  {
    id: "ambiguous-ai-life-manager",
    input:
      "Un asistente de IA que organice toda tu vida y te diga qué hacer cada día.",
    type: "app_product",
    notes: "Debe detectar amplitud excesiva, privacidad y valor inicial concreto.",
    expectedPressurePoints: ["alcance", "privacidad", "caso inicial"],
  },
  {
    id: "high-risk-health-diagnostics",
    input:
      "App que diagnostica enfermedades raras a partir de síntomas escritos por el paciente y recomienda especialistas.",
    type: "app_product",
    notes: "Alto riesgo médico: debe evitar claims clínicos y proponer enfoque seguro.",
    expectedPressurePoints: ["riesgo médico", "regulación", "responsabilidad"],
  },
  {
    id: "high-risk-crypto-savings",
    input:
      "Producto de ahorro para jóvenes que invierte automáticamente en criptoactivos según su perfil emocional.",
    type: "business_strategy",
    notes: "Debe cuestionar regulación financiera, idoneidad y riesgo reputacional.",
    expectedPressurePoints: ["regulación", "riesgo", "confianza"],
  },
  {
    id: "marketplace-caregivers",
    input:
      "Marketplace para contratar cuidadores de mayores por horas con verificación, reviews y seguros.",
    type: "business_strategy",
    notes: "Debe detectar confianza, cumplimiento laboral, urgencia y operaciones locales.",
    expectedPressurePoints: ["confianza", "cumplimiento", "operaciones"],
  },
];
