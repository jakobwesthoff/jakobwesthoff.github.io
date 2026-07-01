// =========================================================
// OpenGraph card generation
// =========================================================
//
// Generates a 1200x630 social-share card per page at build time. One image
// per entry in the shared `pages` map is emitted to `/open-graph/<key>.png`,
// which BaseLayout references as the og:image for that page.
//
// The layout mirrors the site's identity: the ringed circular avatar from the
// homepage, the name beside it, the description below, and a domain tag in the
// corner, all over a blurred, amber-washed render of the avatar. This is a
// flex layout, so it is built with satori (JSX-tree -> SVG) and rasterized
// with resvg. astro-og-canvas was dropped because its fixed logo-above-text
// layout cannot place the title beside the avatar or blur the background.
//
// Fonts are vendored locally (src/assets/fonts) so builds stay deterministic
// and offline-capable.

import fs from "node:fs/promises";
import path from "node:path";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import sharp from "sharp";
import type { APIRoute } from "astro";
import { pages, type PageKey } from "../../data/pages";

const [WIDTH, HEIGHT] = [1200, 630];

// Asset paths are resolved from the project root, which is the working
// directory during `astro build`.
const ROOT = process.cwd();
const AVATAR = path.join(ROOT, "src/assets/avatar.png");
const FONT_REGULAR = path.join(ROOT, "src/assets/fonts/inter-latin-400-normal.ttf");
const FONT_BOLD = path.join(ROOT, "src/assets/fonts/inter-latin-700-normal.ttf");

const DOMAIN_TAG = "WESTHOFFSWELT.DE";

// Palette lifted from the site: gray-900 ink on the amber brand background,
// with gray-700 for the lighter description.
const INK = "#111827";
const INK_SOFT = "#374151";
const BRAND = { r: 243, g: 171, b: 39 }; // #F3AB27

// The homepage avatar wears `ring-4 ring-white/90` and `shadow-2xl`; these
// reproduce that ring and drop shadow on the card.
const AVATAR_RING = {
  border: "8px solid rgba(255,255,255,0.9)",
  boxShadow: "0 25px 50px -12px rgba(0,0,0,0.45)",
};

// =========================================================
// Baked blurred background
// =========================================================
//
// The live site blurs the avatar entirely in CSS:
//   blur(80px) saturate(1.3) brightness(1.1) sepia(0.3) hue-rotate(-10deg)
// over the amber base with a warm diagonal gradient wash (body::before /
// body::after in global.css). satori has no blur filter, so the same look is
// approximated once with sharp and embedded as the card's background image.

// A satori/resvg render tree is plain React-element-like objects. These
// helpers keep the layout below readable without pulling in JSX (the project's
// tsconfig targets Preact's JSX runtime, which satori does not expect).
type Style = Record<string, unknown>;
interface Node {
  type: string;
  props: { style: Style; children?: unknown; src?: string };
}
const box = (style: Style, ...children: Node[]): Node => ({
  type: "div",
  props: { style, children },
});
const text = (style: Style, value: string): Node => ({
  type: "div",
  props: { style, children: value },
});
const img = (style: Style, src: string): Node => ({ type: "img", props: { style, src } });

/** Blurred, amber-washed avatar as a data URI, matching the page background. */
async function bakedBackground(): Promise<string> {
  const blurred = await sharp(AVATAR)
    .resize(WIDTH, HEIGHT, { fit: "cover" })
    // sigma 60 reads visually like the CSS 80px blur radius at this size.
    .blur(60)
    .modulate({ brightness: 1.08, saturation: 1.35, hue: -10 })
    .tint(BRAND)
    .toBuffer();

  // Warm diagonal wash mirroring body::after, over an opaque amber base so the
  // corners never fall through to black.
  const wash = Buffer.from(
    `<svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
       <defs>
         <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
           <stop offset="0" stop-color="#FDBA72" stop-opacity="0.35"/>
           <stop offset="1" stop-color="#FBBF24" stop-opacity="0.35"/>
         </linearGradient>
       </defs>
       <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#g)"/>
     </svg>`
  );

  const composed = await sharp({
    create: { width: WIDTH, height: HEIGHT, channels: 4, background: "#F3AB27" },
  })
    .composite([{ input: blurred }, { input: wash }])
    .png()
    .toBuffer();

  return `data:image/png;base64,${composed.toString("base64")}`;
}

/** Sharp-encoded circular-source avatar as a data URI for the foreground. */
async function avatarDataUri(): Promise<string> {
  const png = await sharp(AVATAR).resize(260, 260, { fit: "cover" }).png().toBuffer();
  return `data:image/png;base64,${png.toString("base64")}`;
}

// =========================================================
// Card layout
// =========================================================

/** The card tree for a single page's title and description. */
function card(title: string, description: string, background: string, avatar: string): Node {
  return box(
    {
      width: WIDTH,
      height: HEIGHT,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: 72,
      // Extra bottom padding lifts the vertically-centered block upward, both
      // for balance and to clear the corner domain tag below.
      paddingBottom: 150,
      position: "relative",
      backgroundImage: `url(${background})`,
      backgroundSize: `${WIDTH}px ${HEIGHT}px`,
    },
    // Avatar and title share a row. The row's maxWidth forces long titles to
    // wrap into a column beside the avatar rather than overflow the card.
    box(
      { display: "flex", flexDirection: "row", alignItems: "center", gap: 36, maxWidth: 1000 },
      img({ width: 180, height: 180, borderRadius: 180, flexShrink: 0, ...AVATAR_RING }, avatar),
      text(
        {
          fontFamily: "Inter",
          fontWeight: 700,
          fontSize: 48,
          color: INK,
          letterSpacing: -1,
          lineHeight: 1.08,
        },
        title
      )
    ),
    text(
      {
        fontFamily: "Inter",
        fontWeight: 400,
        fontSize: 36,
        color: INK_SOFT,
        marginTop: 36,
        textAlign: "center",
        lineHeight: 1.35,
        maxWidth: 980,
      },
      description
    ),
    text(
      {
        position: "absolute",
        bottom: 44,
        left: 72,
        fontFamily: "Inter",
        fontWeight: 700,
        fontSize: 22,
        color: "rgba(17,24,39,0.5)",
        letterSpacing: 2,
      },
      DOMAIN_TAG
    )
  );
}

// =========================================================
// Render pipeline
// =========================================================
//
// The background and fonts are identical for every card, so they are loaded
// once and shared across the per-page GET calls the static build fires.

const shared = (async () => ({
  background: await bakedBackground(),
  avatar: await avatarDataUri(),
  fonts: [
    {
      name: "Inter",
      data: await fs.readFile(FONT_REGULAR),
      weight: 400 as const,
      style: "normal" as const,
    },
    {
      name: "Inter",
      data: await fs.readFile(FONT_BOLD),
      weight: 700 as const,
      style: "normal" as const,
    },
  ],
}))();

// Each key of `pages` becomes `/open-graph/<key>.png`, captured by the
// `[...route]` catch-all.
export function getStaticPaths() {
  return Object.keys(pages).map((key) => ({ params: { route: `${key}.png` } }));
}

export const GET: APIRoute = async ({ params }) => {
  const key = String(params.route).replace(/\.png$/, "") as PageKey;
  const page = pages[key];
  if (!page) return new Response("Not found", { status: 404 });

  const { background, avatar, fonts } = await shared;
  const svg = await satori(card(page.title, page.description, background, avatar), {
    width: WIDTH,
    height: HEIGHT,
    fonts,
  });
  const png = new Resvg(svg, { fitTo: { mode: "width", value: WIDTH } }).render().asPng();

  // `asPng()` returns a Node Buffer; hand the Web Response a plain Uint8Array,
  // which is a valid BodyInit.
  return new Response(new Uint8Array(png), { headers: { "Content-Type": "image/png" } });
};
