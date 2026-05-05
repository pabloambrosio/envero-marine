export interface ProviderSection {
  id: string;
  title: string;
  description: {
    es: string;
    en: string;
  };
  offerings: string[];
  isOwnService: boolean;
}

export const sections: ProviderSection[] = [
  {
    id: "totalenergies",
    title: "TotalEnergies",
    isOwnService: false,
    description: {
      es: "Compañía energética global con sede en Francia. Su división de lubricantes desarrolla aceites y grasas para industria, transporte y operaciones marinas.",
      en: "Global energy company headquartered in France. Its lubricants division develops oils and greases for industry, transport, and marine operations.",
    },
    offerings: [
      "Aceites sintéticos",
      "Aceites minerales",
      "Aceites hidráulicos",
      "Aceites de alto grado de viscosidad",
      "Aceites para turbinas y compresores",
      "Aceites para la industria alimentaria",
      "Aceites para transferencia de calor",
      "Grasa de sulfonado de complejo de calcio",
      "Grasa compleja de aluminio",
      "Grasa sintética de complejo de litio",
      "Grasas de poliurea",
      "Grasas multifuncionales",
      "Anticongelantes",
    ],
  },
  {
    id: "current-technology",
    title: "Current Technology",
    isOwnService: false,
    description: {
      es: "Especialistas en protección contra sobretensiones y calidad de energía. Tres décadas equipando tableros eléctricos críticos en infraestructura industrial.",
      en: "Specialists in surge protection and power quality. Three decades equipping critical electrical panels across industrial infrastructure.",
    },
    offerings: [
      "Dispositivos de protección contra sobretensiones (SPD)",
      "Supresores de picos de voltaje para tableros principales y subdistribuciones",
      "Soluciones para sistemas de control, iluminación y telecomunicaciones",
      "Monitoreo continuo de calidad de energía con alertas remotas",
      "Compatibilidad con reguladores y otras soluciones de calidad de energía",
    ],
  },
  {
    id: "qer",
    title: "Qer",
    isOwnService: false,
    description: {
      es: "Fabricante de químicos industriales para limpieza y desinfección. Línea técnica que cubre desde solventes hasta especialidades en aerosol.",
      en: "Industrial chemicals manufacturer for cleaning and disinfection. A technical line spanning from solvents to specialty aerosols.",
    },
    offerings: [
      "Solventes",
      "Desengrasantes",
      "Desincrustantes y limpiadores para metales",
      "Desinfectantes",
      "Limpiadores de uso general",
      "Limpiadores de uso específico",
      "Lavandería industrial",
      "Especialidades en aerosol",
      "Limpieza y desinfección de salas de ordeño",
    ],
  },
  {
    id: "fonroche",
    title: "Fonroche Lighting America",
    isOwnService: false,
    description: {
      es: "Fabricante francés de alumbrado solar autónomo. Sistemas con doce años de operación sin mantenimiento, instalados en proyectos públicos y privados.",
      en: "French manufacturer of autonomous solar lighting. Systems engineered for twelve years of zero-maintenance operation across public and private projects.",
    },
    offerings: [
      "Alumbrado público solar",
      "Proyectos de iluminación solar autónoma",
      "Sistemas con 12 años de operación sin mantenimiento",
    ],
  },
  {
    id: "estructuras-metalicas",
    title: "Fabricación de estructuras metálicas",
    isOwnService: true,
    description: {
      es: "Servicio propio de Envero. Diseñamos y fabricamos estructuras metálicas para industria y sector naval — desde racks y bases hasta protecciones con tratamiento anticorrosivo.",
      en: "An in-house Envero service. We design and fabricate steel structures for industry and the marine sector — from racks and bases to corrosion-protected guards.",
    },
    offerings: [
      "Racks y bastidores industriales",
      "Canastillas metálicas de transporte",
      "Cajas de herramienta metálicas",
      "Contenedores",
      "Estructuras para techumbres y cubiertas",
      "Bases metálicas para generadores, motores y bombas",
      "Escaleras marinas, escotillas y pasamanos",
      "Barandales, rejillas y protecciones industriales",
      "Ductos metálicos y tolvas",
      "Tratamiento anticorrosivo",
    ],
  },
  {
    id: "ingenieria-naval",
    title: "Arquitectura e ingeniería naval",
    isOwnService: true,
    description: {
      es: "Servicio propio de Envero. Documentación, diseño y cálculo para abanderamiento, modificación y repotencialización de embarcaciones bajo estándares marinos.",
      en: "An in-house Envero service. Documentation, design, and engineering for vessel flagging, modification, and repowering under marine standards.",
    },
    offerings: [
      "Documentación e ingeniería de bandera",
      "Diseño e ingeniería del sector naval e industrial",
      "Inspecciones",
      "Adecuación y modificación de embarcaciones con asistencia técnica",
      "Diseño y rediseño de embarcaciones",
      "Abanderamientos",
      "Cálculo de escantillonado",
      "Cuadernillo de estabilidad y curvas cruzadas",
      "Cálculo de arqueo y francobordo",
      "Repotencialización de embarcaciones",
      "Experimento de inclinación y ajuste de peso en rosca",
      "Sección de hélices y selección de timón",
      "Planos de arreglo general, capacidad de tanques, estructurales, seguridad y contraincendio",
      "Códigos IGS, SOPEP, SMPEP, PBIP PPB, ETB Manual, PEEB",
    ],
  },
];
