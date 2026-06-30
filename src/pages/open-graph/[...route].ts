// =========================================================
// OpenGraph card generation
// =========================================================
//
// Generates a 1200x630 social-share card per page at build time using
// astro-og-canvas (Skia). One image per entry in the shared `pages` map is
// emitted to `/open-graph/<key>.png`, which BaseLayout references as the
// og:image for that page.
//
// Fonts are vendored locally (src/assets/fonts) rather than fetched from a
// remote font API. The cards are self-hosted, so this keeps builds
// deterministic and offline-capable.

import { OGImageRoute } from "astro-og-canvas";
import { pages } from "../../data/pages";

export const { getStaticPaths, GET } = await OGImageRoute({
  // Each key of `pages` becomes a path captured by the `[...route]` catch-all,
  // rendering to `/open-graph/<key>.png`.
  pages,
  getImageOptions: (_path, page) => ({
    title: page.title,
    description: page.description,
    // Brand background (#F3AB27) as a single-stop gradient.
    bgGradient: [[243, 171, 39]],
    logo: {
      path: "./src/assets/avatar.png",
      size: [200, 200],
    },
    font: {
      // Sized down from the defaults (70/40) so a long title plus a
      // search-length description both fit within the 630px card height.
      title: { color: [17, 24, 39], weight: "Bold", size: 54 },
      description: { color: [55, 65, 81], size: 30 },
    },
    fonts: [
      "./src/assets/fonts/inter-latin-400-normal.ttf",
      "./src/assets/fonts/inter-latin-700-normal.ttf",
    ],
  }),
});
