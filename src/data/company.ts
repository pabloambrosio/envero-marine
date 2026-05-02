export interface CompanyLocation {
  street: string;
  postalCode: string;
  city: string;
  state: string;
  country: string;
}

export interface CompanyContact {
  whatsapp: string;
  email: string;
  web: string;
}

export interface CompanyInfo {
  name: string;
  tagline: string;
  mission: string;
  vision: string;
  serviceLines: string[];
  representedBrands: string[];
  location: CompanyLocation;
  contact: CompanyContact;
}

export const company: CompanyInfo = {
  name: "Envero Marine",
  tagline: "Outstanding Services",
  mission:
    "Cuidar y optimizar las instalaciones de nuestros clientes, ofreciendo productos y servicios de la más alta calidad y eficiencia. Brindamos soluciones personalizadas en calidad de energía, mantenimiento, arquitectura e ingeniería naval, garantizando seguridad, confiabilidad y valor sostenible.",
  vision:
    "Ser la empresa de referencia en soluciones integrales para la industria y el sector naval, reconocida por su excelencia, innovación y compromiso con la eficiencia y la calidad en cada proyecto.",
  serviceLines: [
    "Calidad de la energía (SPDs)",
    "Químicos de mantenimiento",
    "Grasas, aceites y lubricantes",
    "Proyectos solares",
    "Fabricación de estructuras",
    "Arquitectura e ingeniería naval",
  ],
  representedBrands: [
    "TotalEnergies",
    "Current Technology",
    "Fonroche Lighting America",
    "Qer",
  ],
  location: {
    street: "Calle Obsidiana",
    postalCode: "24154",
    city: "Cd. del Carmen",
    state: "Campeche",
    country: "México",
  },
  contact: {
    whatsapp: "938.135.3874",
    email: "cotizaciones@envemar.com.mx",
    web: "www.envemar.com.mx",
  },
};
