import type { Lang } from "../i18n/ui";

export type LocalizedString = Record<Lang, string>;

/** Par etiqueta/valor de una ficha técnica. El valor no se traduce:
 *  son cifras y designaciones normalizadas (ISO VG 46, IP66, 40 kA). */
export interface ProductSpec {
  label: LocalizedString;
  value: string;
}

export interface CatalogProduct {
  /** Código interno de referencia — se muestra en mono, es el ancla visual. */
  code: string;
  name: string;
  summary: LocalizedString;
  specs: ProductSpec[];
  applications: LocalizedString[];
}

/** Agrupación de productos dentro de una marca (familia / línea técnica). */
export interface CatalogLine {
  id: string;
  title: LocalizedString;
  description: LocalizedString;
  products: CatalogProduct[];
}

export interface CatalogStat {
  value: string;
  label: LocalizedString;
}

/** "wip" muestra el aviso de en construcción y oculta líneas y cifras;
 *  "live" publica la hoja completa. Se pasa a "live" por marca cuando el
 *  catálogo real de ese fabricante esté cargado. */
export type CatalogStatus = "wip" | "live";

export interface CatalogBrand {
  /** Slug de ruta: /catalog/<slug> y /en/catalog/<slug>. */
  slug: string;
  name: string;
  logo: string;
  status: CatalogStatus;
  /** Etiqueta de relación comercial (mono, eyebrow). */
  kicker: LocalizedString;
  headline: LocalizedString;
  lead: LocalizedString;
  stats: CatalogStat[];
  lines: CatalogLine[];
  /** Normas y certificaciones; se listan tal cual, sin traducir. */
  standards: string[];
}

// NOTA: datos de muestra. Las cifras, códigos y fichas técnicas son
// inventados para dimensionar el layout; hay que reemplazarlos con el
// catálogo real de cada fabricante antes de publicar.
export const catalogBrands: CatalogBrand[] = [
  {
    slug: "totalenergies",
    name: "TotalEnergies",
    logo: "/logos/totalenergies.svg",
    status: "wip",
    kicker: {
      es: "Marca representada · Lubricantes",
      en: "Represented brand · Lubricants",
    },
    headline: {
      es: "Lubricación industrial y marina con respaldo de fabricante",
      en: "Industrial and marine lubrication with manufacturer backing",
    },
    lead: {
      es: "Aceites, grasas y fluidos técnicos para maquinaria de operación continua. Suministro directo desde la red oficial, con ficha técnica, hoja de seguridad y trazabilidad de lote en cada entrega.",
      en: "Oils, greases and technical fluids for continuously running machinery. Direct supply through the official network, with datasheet, safety sheet and batch traceability on every delivery.",
    },
    stats: [
      { value: "13", label: { es: "familias de producto", en: "product families" } },
      { value: "5", label: { es: "grados ISO VG en stock", en: "ISO VG grades in stock" } },
      { value: "48 h", label: { es: "entrega en zona sureste", en: "delivery, southeast region" } },
    ],
    standards: ["ISO 21469", "NSF H1", "DIN 51502", "API CK-4", "ISO 6743"],
    lines: [
      {
        id: "aceites-industriales",
        title: { es: "Aceites industriales", en: "Industrial oils" },
        description: {
          es: "Bases sintéticas y minerales para reductores, compresores y sistemas hidráulicos bajo carga sostenida.",
          en: "Synthetic and mineral bases for gearboxes, compressors and hydraulic systems under sustained load.",
        },
        products: [
          {
            code: "TE-HYD-4600",
            name: "Azolla ZS 46",
            summary: {
              es: "Hidráulico antidesgaste para sistemas de alta presión con bombas de paletas y pistones.",
              en: "Anti-wear hydraulic fluid for high-pressure systems with vane and piston pumps.",
            },
            specs: [
              { label: { es: "Grado", en: "Grade" }, value: "ISO VG 46" },
              { label: { es: "Índice de viscosidad", en: "Viscosity index" }, value: "104" },
              { label: { es: "Punto de inflamación", en: "Flash point" }, value: "220 °C" },
              { label: { es: "Presentación", en: "Pack size" }, value: "20 L · 208 L" },
            ],
            applications: [
              { es: "Grúas de cubierta", en: "Deck cranes" },
              { es: "Prensas hidráulicas", en: "Hydraulic presses" },
              { es: "Sistemas de gobierno", en: "Steering systems" },
            ],
          },
          {
            code: "TE-GER-3200",
            name: "Carter SH 320",
            summary: {
              es: "Aceite sintético PAO para reductores cerrados con temperatura de operación elevada.",
              en: "PAO synthetic oil for enclosed gearboxes operating at elevated temperature.",
            },
            specs: [
              { label: { es: "Grado", en: "Grade" }, value: "ISO VG 320" },
              { label: { es: "Base", en: "Base" }, value: "PAO sintética" },
              { label: { es: "Rango térmico", en: "Thermal range" }, value: "−30 a 140 °C" },
              { label: { es: "Intervalo de cambio", en: "Drain interval" }, value: "8 000 h" },
            ],
            applications: [
              { es: "Reductores de winche", en: "Winch gearboxes" },
              { es: "Molinos y mezcladoras", en: "Mills and mixers" },
            ],
          },
          {
            code: "TE-CMP-1000",
            name: "Dacnis SH 100",
            summary: {
              es: "Fluido para compresores de tornillo con servicio continuo y baja formación de depósitos.",
              en: "Screw-compressor fluid for continuous duty with low deposit formation.",
            },
            specs: [
              { label: { es: "Grado", en: "Grade" }, value: "ISO VG 100" },
              { label: { es: "Vida útil", en: "Service life" }, value: "8 000 h" },
              { label: { es: "Demulsibilidad", en: "Demulsibility" }, value: "40/40/0 (15 min)" },
            ],
            applications: [
              { es: "Compresores de aire de planta", en: "Plant air compressors" },
              { es: "Sistemas neumáticos", en: "Pneumatic systems" },
            ],
          },
        ],
      },
      {
        id: "grasas",
        title: { es: "Grasas técnicas", en: "Technical greases" },
        description: {
          es: "Complejos de litio, calcio y poliurea para rodamientos expuestos a carga, agua salada o alta temperatura.",
          en: "Lithium, calcium and polyurea complexes for bearings exposed to load, saltwater or high temperature.",
        },
        products: [
          {
            code: "TE-GRS-CA22",
            name: "Ceran XM 220",
            summary: {
              es: "Grasa de complejo de calcio sulfonado con resistencia probada al lavado por agua salada.",
              en: "Sulfonated calcium complex grease with proven resistance to saltwater washout.",
            },
            specs: [
              { label: { es: "Consistencia", en: "Consistency" }, value: "NLGI 2" },
              { label: { es: "Temperatura máx.", en: "Max. temperature" }, value: "160 °C" },
              { label: { es: "Carga soldadura", en: "Weld load" }, value: "4 800 N" },
              { label: { es: "Lavado por agua", en: "Water washout" }, value: "< 2 %" },
            ],
            applications: [
              { es: "Rodamientos de cubierta", en: "Deck bearings" },
              { es: "Equipo portuario", en: "Port equipment" },
            ],
          },
          {
            code: "TE-GRS-PU30",
            name: "Multis Complex HV 2",
            summary: {
              es: "Poliurea de larga vida para motores eléctricos y rodamientos sellados de alta velocidad.",
              en: "Long-life polyurea for electric motors and sealed high-speed bearings.",
            },
            specs: [
              { label: { es: "Consistencia", en: "Consistency" }, value: "NLGI 2" },
              { label: { es: "Velocidad", en: "Speed factor" }, value: "500 000 n·dm" },
              { label: { es: "Relubricación", en: "Relubrication" }, value: "6 000 h" },
            ],
            applications: [
              { es: "Motores eléctricos", en: "Electric motors" },
              { es: "Ventiladores industriales", en: "Industrial fans" },
            ],
          },
        ],
      },
      {
        id: "especialidades",
        title: { es: "Especialidades", en: "Specialties" },
        description: {
          es: "Fluidos de transferencia térmica, anticongelantes y lubricación grado alimenticio.",
          en: "Heat transfer fluids, coolants and food-grade lubrication.",
        },
        products: [
          {
            code: "TE-NSF-4600",
            name: "Nevastane SL 46",
            summary: {
              es: "Lubricante grado alimenticio para maquinaria con riesgo de contacto incidental.",
              en: "Food-grade lubricant for machinery with incidental contact risk.",
            },
            specs: [
              { label: { es: "Registro", en: "Registration" }, value: "NSF H1" },
              { label: { es: "Grado", en: "Grade" }, value: "ISO VG 46" },
              { label: { es: "Certificación", en: "Certification" }, value: "ISO 21469" },
            ],
            applications: [
              { es: "Líneas de proceso alimentario", en: "Food processing lines" },
              { es: "Envasado", en: "Packaging" },
            ],
          },
          {
            code: "TE-HTF-3200",
            name: "Seriola ETA 32",
            summary: {
              es: "Fluido de transferencia de calor para circuitos cerrados hasta 320 °C.",
              en: "Heat transfer fluid for closed circuits up to 320 °C.",
            },
            specs: [
              { label: { es: "Rango térmico", en: "Thermal range" }, value: "hasta 320 °C" },
              { label: { es: "Grado", en: "Grade" }, value: "ISO VG 32" },
            ],
            applications: [
              { es: "Calderas de aceite térmico", en: "Thermal oil boilers" },
              { es: "Intercambiadores", en: "Heat exchangers" },
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "current-technology",
    name: "Current Technology",
    logo: "/logos/current-technology.webp",
    status: "wip",
    kicker: {
      es: "Marca representada · Calidad de energía",
      en: "Represented brand · Power quality",
    },
    headline: {
      es: "Protección contra sobretensiones para tableros críticos",
      en: "Surge protection for critical switchboards",
    },
    lead: {
      es: "Supresores (SPD) y monitoreo de calidad de energía para instalaciones donde una parada no negociada cuesta más que el equipo. Selección por nivel de tablero, coordinación entre etapas y puesta en marcha en sitio.",
      en: "Surge protective devices and power quality monitoring for facilities where an unplanned stop costs more than the equipment. Sizing by panel level, stage coordination and on-site commissioning.",
    },
    stats: [
      { value: "3", label: { es: "niveles de coordinación", en: "coordination levels" } },
      { value: "300 kA", label: { es: "capacidad máx. por fase", en: "max. per-phase rating" } },
      { value: "10 años", label: { es: "garantía de fabricante", en: "manufacturer warranty" } },
    ],
    standards: ["UL 1449 4th Ed.", "IEEE C62.41.2", "NEMA 4X", "IEC 61643-11"],
    lines: [
      {
        id: "spd-servicio",
        title: { es: "SPD de acometida", en: "Service entrance SPD" },
        description: {
          es: "Primera etapa de protección en el tablero principal, donde llega el transitorio de origen externo.",
          en: "First protection stage at the main switchboard, where externally originated transients arrive.",
        },
        products: [
          {
            code: "CT-SE-300",
            name: "Transient Blocker SE-300",
            summary: {
              es: "SPD de acometida para tableros principales con indicación de estado por fase.",
              en: "Service entrance SPD for main switchboards with per-phase status indication.",
            },
            specs: [
              { label: { es: "Capacidad", en: "Surge rating" }, value: "300 kA/fase" },
              { label: { es: "Tensión", en: "Voltage" }, value: "480Y/277 V" },
              { label: { es: "Envolvente", en: "Enclosure" }, value: "NEMA 4X" },
              { label: { es: "Modos", en: "Protection modes" }, value: "L-N, L-G, N-G, L-L" },
            ],
            applications: [
              { es: "Subestación de planta", en: "Plant substation" },
              { es: "Tablero general de muelle", en: "Dock main panel" },
            ],
          },
          {
            code: "CT-SE-160",
            name: "Transient Blocker SE-160",
            summary: {
              es: "Versión compacta para acometidas de menor capacidad instalada.",
              en: "Compact version for service entrances with lower installed capacity.",
            },
            specs: [
              { label: { es: "Capacidad", en: "Surge rating" }, value: "160 kA/fase" },
              { label: { es: "Tensión", en: "Voltage" }, value: "208Y/120 V" },
              { label: { es: "Envolvente", en: "Enclosure" }, value: "NEMA 4" },
            ],
            applications: [
              { es: "Edificios administrativos", en: "Administrative buildings" },
              { es: "Talleres", en: "Workshops" },
            ],
          },
        ],
      },
      {
        id: "spd-distribucion",
        title: { es: "SPD de distribución y punto de uso", en: "Distribution and point-of-use SPD" },
        description: {
          es: "Segunda y tercera etapa: subtableros, control, iluminación y telecomunicaciones.",
          en: "Second and third stage: sub-panels, control, lighting and telecom.",
        },
        products: [
          {
            code: "CT-DP-080",
            name: "Panel Guard DP-80",
            summary: {
              es: "Protección de subdistribución con módulos reemplazables sin desenergizar el tablero.",
              en: "Sub-distribution protection with modules replaceable without de-energizing the panel.",
            },
            specs: [
              { label: { es: "Capacidad", en: "Surge rating" }, value: "80 kA/fase" },
              { label: { es: "Respuesta", en: "Response time" }, value: "< 1 ns" },
              { label: { es: "Contacto seco", en: "Dry contact" }, value: "Sí" },
            ],
            applications: [
              { es: "Subtableros de proceso", en: "Process sub-panels" },
              { es: "Tableros de control", en: "Control panels" },
            ],
          },
          {
            code: "CT-DL-024",
            name: "Data Line Guard 24",
            summary: {
              es: "Protección de líneas de datos y señal para lazos de instrumentación 4–20 mA.",
              en: "Data and signal line protection for 4–20 mA instrumentation loops.",
            },
            specs: [
              { label: { es: "Tensión de línea", en: "Line voltage" }, value: "24 Vcd" },
              { label: { es: "Ancho de banda", en: "Bandwidth" }, value: "10 MHz" },
              { label: { es: "Montaje", en: "Mounting" }, value: "Riel DIN" },
            ],
            applications: [
              { es: "Instrumentación de campo", en: "Field instrumentation" },
              { es: "SCADA y telemetría", en: "SCADA and telemetry" },
            ],
          },
        ],
      },
      {
        id: "monitoreo",
        title: { es: "Monitoreo de calidad de energía", en: "Power quality monitoring" },
        description: {
          es: "Registro continuo de eventos con alerta remota, para pasar de mantenimiento reactivo a diagnóstico.",
          en: "Continuous event logging with remote alerting, moving from reactive maintenance to diagnosis.",
        },
        products: [
          {
            code: "CT-PQM-500",
            name: "PowerScope 500",
            summary: {
              es: "Analizador permanente de eventos con histórico y notificación por correo.",
              en: "Permanent event analyzer with history log and email notification.",
            },
            specs: [
              { label: { es: "Muestreo", en: "Sampling" }, value: "256 muestras/ciclo" },
              { label: { es: "Memoria", en: "Memory" }, value: "12 meses" },
              { label: { es: "Comunicación", en: "Communication" }, value: "Modbus TCP · SNMP" },
            ],
            applications: [
              { es: "Auditoría de red interna", en: "Internal network audit" },
              { es: "Diagnóstico de fallas recurrentes", en: "Recurring fault diagnosis" },
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "qer",
    name: "Qer",
    logo: "/logos/qer.png",
    status: "wip",
    kicker: {
      es: "Marca representada · Químicos de mantenimiento",
      en: "Represented brand · Maintenance chemicals",
    },
    headline: {
      es: "Química técnica para limpieza, desinfección y mantenimiento",
      en: "Technical chemistry for cleaning, disinfection and maintenance",
    },
    lead: {
      es: "Línea completa de desengrasantes, solventes y desinfectantes con hoja de seguridad y dosificación documentada. Formulaciones compatibles con superficies metálicas expuestas a ambiente salino.",
      en: "A full line of degreasers, solvents and disinfectants with safety sheets and documented dosing. Formulations compatible with metal surfaces exposed to saline environments.",
    },
    stats: [
      { value: "24", label: { es: "referencias activas", en: "active references" } },
      { value: "1:40", label: { es: "dilución máxima típica", en: "typical max. dilution" } },
      { value: "100 %", label: { es: "productos con HDS", en: "products with SDS" } },
    ],
    standards: ["NOM-018-STPS", "GHS/SGA", "ASTM D1748", "NSF C1"],
    lines: [
      {
        id: "limpieza-industrial",
        title: { es: "Limpieza industrial", en: "Industrial cleaning" },
        description: {
          es: "Desengrasantes y removedores para taller, sala de máquinas y superficies de proceso.",
          en: "Degreasers and removers for workshop, engine room and process surfaces.",
        },
        products: [
          {
            code: "QR-DG-220",
            name: "Degrax 220",
            summary: {
              es: "Desengrasante alcalino concentrado, biodegradable, para grasa pesada y hollín.",
              en: "Concentrated biodegradable alkaline degreaser for heavy grease and soot.",
            },
            specs: [
              { label: { es: "pH", en: "pH" }, value: "12.5" },
              { label: { es: "Dilución", en: "Dilution" }, value: "1:10 a 1:40" },
              { label: { es: "Presentación", en: "Pack size" }, value: "20 L · 200 L" },
            ],
            applications: [
              { es: "Sala de máquinas", en: "Engine room" },
              { es: "Pisos de taller", en: "Workshop floors" },
            ],
          },
          {
            code: "QR-SOL-118",
            name: "Solvex 118",
            summary: {
              es: "Solvente dieléctrico para limpieza de tableros y motores sin desmontar.",
              en: "Dielectric solvent for cleaning panels and motors without disassembly.",
            },
            specs: [
              { label: { es: "Rigidez dieléctrica", en: "Dielectric strength" }, value: "32 kV" },
              { label: { es: "Evaporación", en: "Evaporation" }, value: "Rápida, sin residuo" },
              { label: { es: "Presentación", en: "Pack size" }, value: "Aerosol 400 ml · 19 L" },
            ],
            applications: [
              { es: "Tableros eléctricos", en: "Electrical panels" },
              { es: "Motores y devanados", en: "Motors and windings" },
            ],
          },
        ],
      },
      {
        id: "desinfeccion",
        title: { es: "Desinfección", en: "Disinfection" },
        description: {
          es: "Sanitizantes de amonio cuaternario para áreas comunes, comedores y alojamiento a bordo.",
          en: "Quaternary ammonium sanitizers for common areas, galleys and onboard accommodation.",
        },
        products: [
          {
            code: "QR-SAN-500",
            name: "Sanitex Q5",
            summary: {
              es: "Desinfectante de amonio cuaternario de quinta generación, sin enjuague.",
              en: "Fifth-generation quaternary ammonium disinfectant, no rinse required.",
            },
            specs: [
              { label: { es: "Concentración", en: "Concentration" }, value: "5 % activo" },
              { label: { es: "Tiempo de contacto", en: "Contact time" }, value: "5 min" },
              { label: { es: "Dilución", en: "Dilution" }, value: "1:100" },
            ],
            applications: [
              { es: "Comedores y cocinas", en: "Galleys and kitchens" },
              { es: "Camarotes", en: "Cabins" },
            ],
          },
        ],
      },
      {
        id: "proteccion",
        title: { es: "Protección de superficies", en: "Surface protection" },
        description: {
          es: "Inhibidores de corrosión y películas protectoras para equipo almacenado o en tránsito.",
          en: "Corrosion inhibitors and protective films for stored or in-transit equipment.",
        },
        products: [
          {
            code: "QR-VCI-70",
            name: "Protek VCI 70",
            summary: {
              es: "Película protectora temporal contra corrosión atmosférica en ambiente marino.",
              en: "Temporary protective film against atmospheric corrosion in marine environments.",
            },
            specs: [
              { label: { es: "Protección", en: "Protection" }, value: "12 meses en interior" },
              { label: { es: "Espesor", en: "Film thickness" }, value: "25 µm" },
              { label: { es: "Remoción", en: "Removal" }, value: "Con Degrax 220" },
            ],
            applications: [
              { es: "Refacciones en almacén", en: "Warehouse spares" },
              { es: "Equipo en tránsito", en: "Equipment in transit" },
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "fonroche",
    name: "Fonroche Lighting America",
    logo: "/logos/fonroche.webp",
    status: "wip",
    kicker: {
      es: "Marca representada · Alumbrado solar",
      en: "Represented brand · Solar lighting",
    },
    headline: {
      es: "Alumbrado solar autónomo, sin obra eléctrica ni consumo de red",
      en: "Autonomous solar lighting, with no electrical works or grid draw",
    },
    lead: {
      es: "Luminarias 100 % autónomas dimensionadas por irradiación del sitio, con autonomía verificada para temporada de lluvias. Se instalan sin zanja, sin acometida y sin factura de energía asociada.",
      en: "Fully autonomous luminaires sized against site irradiance, with autonomy verified for the rainy season. Installed with no trenching, no service drop and no associated energy bill.",
    },
    stats: [
      { value: "10", label: { es: "noches de autonomía", en: "nights of autonomy" } },
      { value: "0", label: { es: "consumo de red", en: "grid consumption" } },
      { value: "12 años", label: { es: "vida útil de batería", en: "battery service life" } },
    ],
    standards: ["IP66", "IK10", "IEC 62133", "CE", "ISO 9001"],
    lines: [
      {
        id: "vialidad",
        title: { es: "Vialidad y accesos", en: "Roadways and access" },
        description: {
          es: "Luminarias de poste para caminos, accesos a planta y estacionamientos operativos.",
          en: "Pole-mounted luminaires for roads, plant access and operational parking.",
        },
        products: [
          {
            code: "FR-SL-4000",
            name: "Smartlight 4000",
            summary: {
              es: "Luminaria solar de vialidad con gestión inteligente de carga y detección de presencia.",
              en: "Solar roadway luminaire with smart charge management and presence detection.",
            },
            specs: [
              { label: { es: "Flujo luminoso", en: "Luminous flux" }, value: "4 000 lm" },
              { label: { es: "Autonomía", en: "Autonomy" }, value: "10 noches" },
              { label: { es: "Altura de montaje", en: "Mounting height" }, value: "6 – 9 m" },
              { label: { es: "Protección", en: "Ingress rating" }, value: "IP66 · IK10" },
            ],
            applications: [
              { es: "Caminos de acceso", en: "Access roads" },
              { es: "Estacionamientos", en: "Parking lots" },
            ],
          },
          {
            code: "FR-SL-2500",
            name: "Smartlight 2500",
            summary: {
              es: "Versión de menor flujo para vialidades secundarias y andadores perimetrales.",
              en: "Lower-output version for secondary roads and perimeter walkways.",
            },
            specs: [
              { label: { es: "Flujo luminoso", en: "Luminous flux" }, value: "2 500 lm" },
              { label: { es: "Autonomía", en: "Autonomy" }, value: "8 noches" },
              { label: { es: "Altura de montaje", en: "Mounting height" }, value: "4 – 6 m" },
            ],
            applications: [
              { es: "Andadores", en: "Walkways" },
              { es: "Perímetro de planta", en: "Plant perimeter" },
            ],
          },
        ],
      },
      {
        id: "industrial",
        title: { es: "Áreas industriales y portuarias", en: "Industrial and port areas" },
        description: {
          es: "Proyectores de alto flujo para patios de maniobra, muelles y zonas de carga.",
          en: "High-output floodlights for maneuvering yards, docks and loading areas.",
        },
        products: [
          {
            code: "FR-FL-9000",
            name: "Yardlight 9000",
            summary: {
              es: "Proyector solar para patios de maniobra con doble módulo fotovoltaico.",
              en: "Solar floodlight for maneuvering yards with dual photovoltaic module.",
            },
            specs: [
              { label: { es: "Flujo luminoso", en: "Luminous flux" }, value: "9 000 lm" },
              { label: { es: "Autonomía", en: "Autonomy" }, value: "7 noches" },
              { label: { es: "Viento máx.", en: "Max. wind" }, value: "220 km/h" },
            ],
            applications: [
              { es: "Muelles y patios", en: "Docks and yards" },
              { es: "Zonas de carga", en: "Loading zones" },
            ],
          },
        ],
      },
      {
        id: "seguridad",
        title: { es: "Seguridad y señalización", en: "Safety and signage" },
        description: {
          es: "Puntos de luz autónomos para rutas de evacuación, señalización y sitios sin acometida.",
          en: "Autonomous light points for evacuation routes, signage and sites with no service drop.",
        },
        products: [
          {
            code: "FR-SP-800",
            name: "Safepoint 800",
            summary: {
              es: "Punto de luz compacto para señalización de rutas y puntos de reunión.",
              en: "Compact light point for route signage and assembly points.",
            },
            specs: [
              { label: { es: "Flujo luminoso", en: "Luminous flux" }, value: "800 lm" },
              { label: { es: "Autonomía", en: "Autonomy" }, value: "12 noches" },
              { label: { es: "Instalación", en: "Installation" }, value: "Sin obra eléctrica" },
            ],
            applications: [
              { es: "Rutas de evacuación", en: "Evacuation routes" },
              { es: "Puntos de reunión", en: "Assembly points" },
            ],
          },
        ],
      },
    ],
  },
];

export function getCatalogBrand(slug: string): CatalogBrand | undefined {
  return catalogBrands.find((brand) => brand.slug === slug);
}

/** Href del catálogo de una marca según el idioma activo. */
export function catalogHref(slug: string, lang: Lang): string {
  return lang === "en" ? `/en/catalog/${slug}` : `/catalog/${slug}`;
}
