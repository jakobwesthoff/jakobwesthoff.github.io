// =========================================================
// Profile identity
// =========================================================
//
// Single source of truth for who this site is about. The social links are
// rendered on the homepage and simultaneously feed the schema.org `sameAs`
// list in the page metadata, so search engines can reconcile this person
// with their profiles elsewhere. Keeping them here avoids the two lists
// drifting apart.

export interface SocialLink {
  href: string;
  /** astro-icon name, e.g. "logos:linkedin-icon". */
  icon: string;
  label: string;
}

export const profile = {
  name: "Jakob Westhoff",
  jobTitle: "Principal Distributed Systems Software Architect",
  social: [
    {
      href: "https://www.linkedin.com/in/jakobwesthoff/",
      icon: "logos:linkedin-icon",
      label: "LinkedIn",
    },
    { href: "https://www.youtube.com/c/mrjakob", icon: "logos:youtube-icon", label: "YouTube" },
    { href: "https://github.com/jakobwesthoff", icon: "logos:github-icon", label: "GitHub" },
    { href: "https://www.twitch.tv/mr_jakob", icon: "logos:twitch", label: "Twitch" },
  ] satisfies SocialLink[],
};
