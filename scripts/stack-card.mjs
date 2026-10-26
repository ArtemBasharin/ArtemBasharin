// Generates assets/stack-light.svg and assets/stack-dark.svg
// Usage: npm i --no-save simple-icons && node scripts/stack-card.mjs
import { writeFileSync, mkdirSync } from "node:fs";
import * as si from "simple-icons";

const icons = Object.fromEntries(
  Object.values(si).filter((i) => i?.slug).map((i) => [i.slug, i]),
);

// Custom tiles for brands that Simple Icons does not ship
const custom = {
  photoshop: { title: "Photoshop", badge: { text: "Ps", bg: "#001E36", fg: "#31A8FF" } },
};

const rows = [
  ["Frontend", ["html5", "css", "sass", "javascript", "typescript", "react", "nextdotjs", "vite", "tailwindcss"]],
  ["Ecosystem", ["redux", "reactrouter", "mui", "shadcnui", "gsap", "zod", "vitest", "npm", "telegram"]],
  ["Backend & DevOps", ["nodedotjs", "express", "prisma", "postgresql", "mongodb", "docker", "nginx", "ubuntu", "vercel"]],
  ["Engineering & Design", ["git", "postman", "python", "cplusplus", "arduino", "figma", "photoshop", "dassaultsystemes", "coreldraw"]],
];

// Brand colors too deep for the dark tiles, lifted to a lighter shade
const darkTint = { dassaultsystemes: "#3D8FD6" };

const labels = { cplusplus: "C / C++", dassaultsystemes: "SolidWorks", telegram: "Telegram Bots", tailwindcss: "Tailwind" };

const themes = {
  light: { bg: "#ffffff", border: "#d0d7de", tile: "#f6f8fa", tileBorder: "#eaeef2", fg: "#1f2328", muted: "#656d76" },
  dark: { bg: "#0d1117", border: "#30363d", tile: "#161b22", tileBorder: "#21262d", fg: "#e6edf3", muted: "#8b949e" },
};

const W = 980, PAD = 32, COLS = 9, GAP = 12;
const TILE_W = (W - PAD * 2 - GAP * (COLS - 1)) / COLS;
const TILE_H = 92, LABEL_H = 30, ROW_GAP = 18, ICON = 34;
const H = PAD + rows.length * (LABEL_H + TILE_H) + (rows.length - 1) * ROW_GAP + PAD;

const luminance = (hex) => {
  const [r, g, b] = [0, 2, 4].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

function tile(slug, x, y, t, dark, i) {
  const c = custom[slug];
  const icon = icons[slug];
  const title = labels[slug] ?? c?.title ?? icon.title;
  const ix = x + (TILE_W - ICON) / 2, iy = y + 18;
  let glyph;
  if (c) {
    const { text, bg, fg } = c.badge;
    glyph = `<rect x="${ix}" y="${iy}" width="${ICON}" height="${ICON}" rx="7" fill="${bg}"/>` +
      `<text x="${ix + ICON / 2}" y="${iy + ICON / 2 + 6}" text-anchor="middle" font-size="17" font-weight="700" fill="${fg}">${text}</text>`;
  } else {
    // Near-black logos disappear on the dark theme, near-white ones on light
    const lum = luminance(icon.hex);
    const fill = dark && darkTint[slug] ? darkTint[slug]
      : (dark && lum < 0.05) || (!dark && lum > 0.85) ? t.fg : `#${icon.hex}`;
    glyph = `<svg x="${ix}" y="${iy}" width="${ICON}" height="${ICON}" viewBox="0 0 24 24"><path fill="${fill}" d="${icon.path}"/></svg>`;
  }
  return `<g class="t" style="animation-delay:${(i * 0.025).toFixed(3)}s">
  <rect x="${x}" y="${y}" width="${TILE_W}" height="${TILE_H}" rx="14" fill="${t.tile}" stroke="${t.tileBorder}"/>
  ${glyph}
  <text x="${x + TILE_W / 2}" y="${y + TILE_H - 14}" text-anchor="middle" font-size="12" fill="${t.muted}">${esc(title)}</text>
</g>`;
}

function card(name) {
  const t = themes[name];
  const dark = name === "dark";
  let y = PAD, n = 0;
  const body = rows.map(([label, slugs]) => {
    const head = `<circle cx="${PAD + 4}" cy="${y + 10}" r="4" fill="url(#accent)"/>` +
      `<text x="${PAD + 16}" y="${y + 15}" font-size="12" font-weight="600" letter-spacing="1.4" fill="${t.fg}">${esc(label.toUpperCase())}</text>`;
    const tiles = slugs.map((s, c) => tile(s, PAD + c * (TILE_W + GAP), y + LABEL_H, t, dark, n++)).join("\n");
    y += LABEL_H + TILE_H + ROW_GAP;
    return head + "\n" + tiles;
  }).join("\n");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Tech stack">
<defs>
  <linearGradient id="accent" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="#7F5AF0"/><stop offset="1" stop-color="#2CB67D"/>
  </linearGradient>
  <style>
    text { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif; }
    .t { opacity: 0; animation: in .5s ease-out forwards; }
    @keyframes in { from { opacity: 0; } to { opacity: 1; } }
  </style>
</defs>
<rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="20" fill="${t.bg}" stroke="${t.border}"/>
<rect x="${PAD}" y="0" width="${W - PAD * 2}" height="3" rx="1.5" fill="url(#accent)"/>
${body}
</svg>
`;
}

mkdirSync("assets", { recursive: true });
for (const name of Object.keys(themes)) writeFileSync(`assets/stack-${name}.svg`, card(name));
