/**
 * Genera las imágenes de preview social (Open Graph / Twitter Card) en
 * `public/og/`, una por idioma.
 *
 *   yarn og
 *
 * Renderiza un HTML con las mismas fuentes, colores y logo del sitio usando
 * Chrome headless, y lo baja a 1200×630. Correlo cuando cambie el copy del
 * hero, la paleta o el logo — el PNG está commiteado, no se regenera solo.
 *
 * Requiere Google Chrome instalado (ver CHROME).
 */
import { readFileSync, writeFileSync, readdirSync, mkdirSync, statSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";
import sharp from "sharp";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const TMP = tmpdir();
const CHROME =
  process.env.CHROME_PATH ??
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

// ── fuentes locales: las mismas que Astro descarga de fontsource ─────────
// Los nombres llevan hash, así que buscamos por prefijo.
const fontDir = join(ROOT, ".astro/fonts");
let fontFiles;
try {
  fontFiles = readdirSync(fontDir);
} catch {
  console.error(
    "No existe .astro/fonts — corré `yarn build` (o `yarn dev`) una vez para que\n" +
      "Astro descargue las fuentes, y volvé a intentar."
  );
  process.exit(1);
}

const font = (prefix) => {
  const f = fontFiles.find((n) => n.startsWith(prefix));
  if (!f) throw new Error(`No encontré la fuente ${prefix} en .astro/fonts`);
  return readFileSync(join(fontDir, f)).toString("base64");
};

const sans600 = font("font-sans-600-normal-latin");
const sans500 = font("font-sans-500-normal-latin");
const mono500 = font("font-mono-500-normal-latin");
const displayItalic = font("font-display-500-italic-latin");

const logo = readFileSync(join(ROOT, "public/logos/envero.webp")).toString("base64");

// ── copy ────────────────────────────────────────────────────────────────
// Espejo del hero (`hero.title.*` en src/i18n/ui.ts). Si cambia allá,
// actualizalo acá y regenerá.
const COPY = {
  es: {
    eyebrow: "Ingeniería y confiabilidad industrial",
    title: ["Cada <em>falla oculta</em>", "cuesta dinero."],
    sub: "Ingeniería que las encuentra, mide y resuelve.",
    fields: [
      ["Sede operativa", "Cd. del Carmen · MX"],
      ["Cobertura", "Golfo de México · Sureste"],
      ["Sector", "Naval e industrial"],
    ],
  },
  en: {
    eyebrow: "Industrial engineering & reliability",
    title: ["Every <em>hidden failure</em>", "costs money."],
    sub: "Engineering that finds, measures, and resolves them.",
    fields: [
      ["Operating base", "Cd. del Carmen · MX"],
      ["Coverage", "Gulf of Mexico · Southeast"],
      ["Sector", "Naval & industrial"],
    ],
  },
};

const html = (c) => `<!doctype html>
<html><head><meta charset="utf-8" />
<style>
  @font-face { font-family: Sans; src: url(data:font/woff2;base64,${sans600}) format("woff2"); font-weight: 600; }
  @font-face { font-family: Sans; src: url(data:font/woff2;base64,${sans500}) format("woff2"); font-weight: 500; }
  @font-face { font-family: Mono; src: url(data:font/woff2;base64,${mono500}) format("woff2"); font-weight: 500; }
  @font-face { font-family: Display; src: url(data:font/woff2;base64,${displayItalic}) format("woff2"); font-weight: 500; font-style: italic; }

  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { width: 1200px; height: 630px; overflow: hidden; }

  .sheet {
    position: relative; width: 1200px; height: 630px;
    background: linear-gradient(135deg, #0A2A24 0%, #0E3D34 55%, #1A5147 100%);
    font-family: Sans, sans-serif; color: #F5F2EC;
    display: flex; flex-direction: column;
  }
  /* retícula de plano */
  .sheet::before {
    content: ""; position: absolute; inset: 0;
    background-image:
      linear-gradient(to right, rgba(245,242,236,0.055) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(245,242,236,0.055) 1px, transparent 1px);
    background-size: 48px 48px;
  }
  /* halo cálido inferior derecho */
  .sheet::after {
    content: ""; position: absolute; right: -140px; bottom: -180px;
    width: 620px; height: 620px; border-radius: 50%;
    background: radial-gradient(circle, rgba(217,132,42,0.20) 0%, rgba(217,132,42,0) 68%);
  }

  .body {
    position: relative; z-index: 1; flex: 1; padding: 0 72px;
    display: flex; flex-direction: column; justify-content: center;
  }

  .eyebrow {
    align-self: flex-start;
    display: inline-flex; align-items: center; gap: 18px;
    font-family: Mono, monospace; font-weight: 500; font-size: 17px;
    letter-spacing: 0.22em; text-transform: uppercase; color: #D9842A;
  }
  .eyebrow::before { content: ""; width: 44px; height: 1px; background: #D9842A; }

  h1 {
    margin-top: 34px; font-weight: 600; font-size: 76px;
    line-height: 1.04; letter-spacing: -0.025em; max-width: 960px;
  }
  h1 em {
    font-family: Display, serif; font-style: italic; font-weight: 500;
    letter-spacing: -0.01em; color: #D9842A;
  }
  .sub {
    margin-top: 26px; font-weight: 500; font-size: 27px; line-height: 1.35;
    letter-spacing: -0.01em; color: rgba(245,242,236,0.68); max-width: 760px;
  }

  /* cajetín, como el title block de un plano */
  .titleblock {
    position: relative; z-index: 1; display: flex; align-items: stretch;
    border-top: 1px solid rgba(245,242,236,0.18);
    background: rgba(10,42,36,0.35);
  }
  .plate {
    background: #F5F2EC; padding: 20px 36px;
    display: flex; align-items: center;
    border-right: 1px solid rgba(245,242,236,0.18);
  }
  .plate img { display: block; height: 76px; width: auto; }

  .fields { flex: 1; display: flex; align-items: center; }
  .field { flex: 1; padding: 24px 30px; border-right: 1px solid rgba(245,242,236,0.14); }
  .field:last-child { border-right: 0; }
  .field .k {
    font-family: Mono, monospace; font-weight: 500; font-size: 13px;
    letter-spacing: 0.2em; text-transform: uppercase; color: rgba(245,242,236,0.45);
  }
  .field .v {
    margin-top: 9px; font-family: Mono, monospace; font-weight: 500;
    font-size: 17px; color: #F5F2EC;
  }

  /* marcas de registro */
  .reg { position: absolute; z-index: 1; width: 22px; height: 22px; opacity: 0.35; }
  .reg::before, .reg::after { content: ""; position: absolute; background: #F5F2EC; }
  .reg::before { left: 0; top: 10px; width: 22px; height: 1px; }
  .reg::after { top: 0; left: 10px; width: 1px; height: 22px; }
  .reg--tl { top: 30px; left: 30px; }
  .reg--tr { top: 30px; right: 30px; }
</style></head>
<body>
  <div class="sheet">
    <span class="reg reg--tl"></span>
    <span class="reg reg--tr"></span>
    <div class="body">
      <span class="eyebrow">${c.eyebrow}</span>
      <h1>${c.title.join("<br />")}</h1>
      <p class="sub">${c.sub}</p>
    </div>
    <div class="titleblock">
      <div class="plate"><img src="data:image/webp;base64,${logo}" alt="" /></div>
      <div class="fields">
        ${c.fields
          .map(([k, v]) => `<div class="field"><div class="k">${k}</div><div class="v">${v}</div></div>`)
          .join("")}
      </div>
    </div>
  </div>
</body></html>`;

const outDir = join(ROOT, "public/og");
mkdirSync(outDir, { recursive: true });

for (const [lang, copy] of Object.entries(COPY)) {
  const htmlPath = join(TMP, `envero-og-${lang}.html`);
  const rawPath = join(TMP, `envero-og-${lang}-2x.png`);
  writeFileSync(htmlPath, html(copy));

  // Renderiza a 2x y bajamos después: el texto queda mucho más limpio que
  // rasterizando directo a 1200×630.
  execFileSync(
    CHROME,
    [
      "--headless=new",
      "--disable-gpu",
      "--hide-scrollbars",
      "--force-device-scale-factor=2",
      "--window-size=1200,630",
      `--screenshot=${rawPath}`,
      `file://${htmlPath}`,
    ],
    { stdio: "pipe" }
  );

  const out = join(outDir, `envero-marine-${lang}.png`);
  await sharp(rawPath)
    .resize(1200, 630, { fit: "cover" })
    // `quality` activa la cuantización a paleta: baja de ~330 KB a ~100 KB,
    // que importa porque WhatsApp descarta previews muy pesados. El dither
    // alto evita que el degradado del fondo se vea en bandas.
    .png({ quality: 92, dither: 1, compressionLevel: 9, effort: 10 })
    .toFile(out);

  const kb = (statSync(out).size / 1024).toFixed(0);
  console.log(`✓ public/og/envero-marine-${lang}.png  ${kb} KB`);
}
