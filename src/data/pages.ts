// =========================================================
// Per-page metadata
// =========================================================
//
// Title and description for each page, single-sourced so each page's
// `<title>` and meta tags (via BaseLayout) read from one place.

export interface PageMeta {
  title: string;
  description: string;
  /** Keep the page out of search indexes (e.g. the legal imprint). */
  noindex?: boolean;
}

export const pages = {
  index: {
    title: "Jakob Westhoff - Distributed Systems Architect by Day, Nerd by Night",
    description:
      "Principal distributed systems architect by day, terminal-tool tinkerer by night. I build resilient backends and hack on whatever sounds fun after midnight.",
  },
  projects: {
    title: "Projects - Jakob Westhoff",
    description:
      "Tools built between midnight and coffee: command-line utilities, an AI episode-sleuth, the occasional raytracer, and whatever rabbit hole comes next.",
  },
  imprint: {
    title: "Impressum - Jakob Westhoff",
    description: "Impressum",
    noindex: true,
  },
} satisfies Record<string, PageMeta>;

export type PageKey = keyof typeof pages;
