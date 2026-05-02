export interface ProviderSection {
  id: string;
  title: string;
  offerings: string[];
  isOwnService: boolean;
}

export const sections: ProviderSection[] = [
  {
    id: "totalenergies",
    title: "TotalEnergies",
    isOwnService: false,
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
