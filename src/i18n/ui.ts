export const languages = {
  es: "Español",
  en: "English",
} as const;

export const defaultLang = "es" satisfies keyof typeof languages;

export type Lang = keyof typeof languages;

export const ui = {
  es: {
    "nav.services": "Servicios",
    "nav.about": "Nosotros",
    "nav.projects": "Proyectos",
    "nav.contact": "Contacto",
    "nav.cta": "Cotización",
    "nav.menuLabel": "Navegación principal",
    "nav.brandAria": "Envero Marine — Inicio",
    "lang.groupLabel": "Idioma",
    "hero.eyebrow": "Outstanding Services",
    "hero.title": "Soluciones marinas de ingeniería al nivel de tu operación.",
    "hero.lead":
      "Servicios técnicos integrales para industrias marítima, portuaria y energética. Diseñamos, implementamos y mantenemos infraestructura crítica con estándares internacionales.",
    "hero.cta.primary": "Conversemos",
    "hero.cta.secondary": "Ver servicios",
    "hero.stats.aria": "Indicadores destacados",
    "hero.stats.experience": "años de experiencia",
    "hero.stats.projects": "proyectos entregados",
    "hero.stats.support": "soporte operativo",
    "meta.title": "Envero Marine — Outstanding Services",
    "meta.description": "Servicios marinos e industriales de excelencia.",
  },
  en: {
    "nav.services": "Services",
    "nav.about": "About",
    "nav.projects": "Projects",
    "nav.contact": "Contact",
    "nav.cta": "Get a quote",
    "nav.menuLabel": "Main navigation",
    "nav.brandAria": "Envero Marine — Home",
    "lang.groupLabel": "Language",
    "hero.eyebrow": "Outstanding Services",
    "hero.title": "Marine engineering solutions at the scale of your operation.",
    "hero.lead":
      "Comprehensive technical services for the maritime, port and energy industries. We design, deploy and maintain critical infrastructure to international standards.",
    "hero.cta.primary": "Let's talk",
    "hero.cta.secondary": "View services",
    "hero.stats.aria": "Key indicators",
    "hero.stats.experience": "years of experience",
    "hero.stats.projects": "projects delivered",
    "hero.stats.support": "operational support",
    "meta.title": "Envero Marine — Outstanding Services",
    "meta.description": "Outstanding marine and industrial services.",
  },
} as const;

export type TranslationKey = keyof (typeof ui)[typeof defaultLang];
