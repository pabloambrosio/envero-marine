import type { Lang } from "../i18n/ui";

export type BadgeColor = "primary" | "accent" | "neutral";

export type Vertical =
  | "energy"
  | "naval"
  | "maintenance"
  | "structural"
  | "lighting"
  | "general";

export type LocalizedString = Record<Lang, string>;

export interface ReasonToBook {
  id: string;
  title: LocalizedString;
  content: string;
  painPoint?: string;
  evidence?: string;
  relatedOfferings?: string[];
  icon?: string;
  badgeColor?: BadgeColor;
  vertical?: Vertical;
  cta?: string;
}

export const reasons: ReasonToBook[] = [
  {
    id: "authorized-partners",
    title: {
      es: "Representante autorizado de marcas líderes",
      en: "Authorized representative of leading brands",
    },
    content:
      "Acceso directo a TotalEnergies, Current Technology, Fonroche Lighting America y Qer. Tecnología validada internacionalmente con respaldo y soporte del fabricante.",
    painPoint:
      "Comprar a intermediarios sin soporte ni garantía del fabricante original.",
    evidence:
      "Distribución y representación oficial de cuatro marcas globales del sector industrial y energético.",
    relatedOfferings: [
      "TotalEnergies",
      "Current Technology",
      "Fonroche Lighting America",
      "Qer",
    ],
    icon: "badge",
    badgeColor: "accent",
    vertical: "general",
  },
  {
    id: "single-supplier",
    title: {
      es: "Seis líneas técnicas en una sola empresa",
      en: "Six technical lines in a single supplier",
    },
    content:
      "Calidad de energía, lubricación, químicos de mantenimiento, alumbrado solar, fabricación de estructuras e ingeniería naval. Una sola conversación cubre la operación completa.",
    painPoint:
      "Coordinar varios proveedores distintos para mantener una misma planta o embarcación.",
    evidence: "Seis líneas operativas activas según el portafolio actual.",
    icon: "layers",
    badgeColor: "primary",
    vertical: "general",
  },
  {
    id: "carmen-location",
    title: {
      es: "Operación en Cd. del Carmen, Campeche",
      en: "Operating from Ciudad del Carmen, Campeche",
    },
    content:
      "Sede en el corazón de la Sonda de Campeche. Cercanía operativa real con plataformas, refinerías y clientes del sector offshore mexicano.",
    painPoint:
      "Tiempos de respuesta largos cuando el proveedor opera lejos de la zona de trabajo.",
    evidence:
      "Domicilio en Calle Obsidiana, C.P. 24154, Cd. del Carmen, Campeche.",
    icon: "compass",
    badgeColor: "neutral",
    vertical: "general",
  },
  {
    id: "power-quality",
    title: {
      es: "Protección contra los costos ocultos de la mala calidad de energía",
      en: "Protection against the hidden costs of poor power quality",
    },
    content:
      "Dispositivos SPD (Supresores de Picos de Voltaje) que actúan frente a sobretensiones transitorias, extienden la vida útil de activos eléctricos y suman monitoreo continuo con alertas remotas.",
    painPoint:
      "Equipos sensibles que fallan sin causa aparente y reducen la vida útil del activo.",
    evidence:
      "Línea industrial completa Current Technology con indicadores visuales y contactos secos para alertas remotas.",
    relatedOfferings: ["Current Technology"],
    icon: "shield",
    badgeColor: "accent",
    vertical: "energy",
  },
  {
    id: "solar-lighting",
    title: {
      es: "Iluminación solar 12 años sin mantenimiento",
      en: "Solar lighting, 12 years maintenance-free",
    },
    content:
      "Proyectos de alumbrado público solar Fonroche Lighting, líder mundial en la categoría. Apaga el costo recurrente de mantener alumbrado convencional y la dependencia de la red eléctrica.",
    painPoint:
      "Mantenimiento permanente y dependencia eléctrica del alumbrado tradicional.",
    evidence: "12 años de iluminación ininterrumpida sin mantenimiento (Fonroche).",
    relatedOfferings: ["Fonroche Lighting America"],
    icon: "sun",
    badgeColor: "accent",
    vertical: "lighting",
  },
  {
    id: "naval-engineering",
    title: {
      es: "Ingeniería naval con cobertura regulatoria",
      en: "Naval engineering with regulatory coverage",
    },
    content:
      "Diseño y rediseño de embarcaciones, abanderamiento, escantillonado, estabilidad, planos de seguridad y contraincendio. Documentación lista para Casas Clasificadoras y organismos reconocidos.",
    painPoint: "Proyectos navales que se atoran en la aprobación regulatoria.",
    evidence:
      "Cobertura de códigos IGS, SOPEP, SMPEP, PBIP PPB, ETB Manual y PEEB.",
    relatedOfferings: ["Arquitectura e ingeniería naval"],
    icon: "anchor",
    badgeColor: "primary",
    vertical: "naval",
  },
  {
    id: "anticorrosive-fabrication",
    title: {
      es: "Estructuras metálicas con tratamiento anticorrosivo",
      en: "Steel structures with anti-corrosion treatment",
    },
    content:
      "Fabricación a medida de racks, bastidores, contenedores, escaleras marinas, pasamanos y bases para equipos, con acabado anticorrosivo pensado para entornos marítimos y offshore.",
    painPoint:
      "Estructuras estándar que no resisten exposición salina ni abrasión offshore.",
    evidence:
      "Servicio integrado de fabricación más tratamiento anticorrosivo en el mismo proveedor.",
    relatedOfferings: ["Fabricación de estructuras metálicas"],
    icon: "structure",
    badgeColor: "primary",
    vertical: "structural",
  },
];
