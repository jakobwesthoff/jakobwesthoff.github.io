// =========================================================
// Per-page metadata
// =========================================================
//
// Title and description for each page, single-sourced so the same strings
// drive three consumers without drifting: the page's `<title>`/meta tags
// (via BaseLayout), the OpenGraph card generated for that page, and the
// canonical-to-card mapping. The keys match the OG route param, so
// `/open-graph/<key>.png` is the social image for that page.

export interface PageMeta {
  title: string;
  description: string;
}

export const pages = {
  index: {
    title: "Jakob Westhoff - Principal Distributed Systems Software Architect",
    description: "Jakob Westhoff - Principal Distributed Systems Software Architect",
  },
  projects: {
    title: "Projects - Jakob Westhoff",
    description: "Projects by Jakob Westhoff",
  },
  imprint: {
    title: "Impressum - Jakob Westhoff",
    description: "Impressum",
  },
} satisfies Record<string, PageMeta>;

export type PageKey = keyof typeof pages;
