/**
 * Curated static registry behind the public Cohort Launch Kit routes
 * (`/cohorts` and `/cohorts/[slug]`). Data is local and static by design:
 * self-serve publishing and a public cohort payload endpoint are backend
 * work tracked separately in zedu-be.
 */

/** One entry in the public cohort registry. Unknown fields are omitted. */
export type Cohort = {
  slug: string;
  title: string;
  tagline: string;
  description: string;
  /** Displayed format, e.g. "Online · 12 weeks". */
  format: string;
  /** Omitted entirely when the start date is unknown. */
  startDate?: string;
  instructor?: { name: string; role: string };
  objectives?: string[];
  status: "active" | "upcoming";
  /** Primary CTA target; defaults to `/auth/sign-up`. */
  ctaUrl?: string;
  /** Secondary CTA target; defaults to `/contact-sales`. */
  secondaryCtaUrl?: string;
  /**
   * `example` entries exist only to demonstrate layout. They must always
   * render the "Example — not a live programme" badge (CohortExampleBadge
   * derives it from this field) and their detail pages are noindexed.
   */
  kind: "real" | "example";
};

export const DEFAULT_CTA_URL = "/auth/sign-up";
export const DEFAULT_SECONDARY_CTA_URL = "/contact-sales";

/**
 * The single source of truth rendered by both public cohort routes.
 * The one real entry states only facts that are known about it; example
 * entries are generic and never presented as live programmes.
 */
export const cohorts: Cohort[] = [
  {
    slug: "hng-15",
    title: "HNG 15 Internship Cohort",
    tagline:
      "HNG's 15th internship cohort — a learning community running on Zedu.",
    description:
      "HNG's 15th internship cohort is a learning community running on Zedu. The teams that built Zedu did so during the HNG 15 internship — meet them on the contributors page.",
    format: "Online",
    status: "active",
    kind: "real",
  },
  {
    slug: "example-data-analytics-cohort",
    title: "Example Data Analytics Cohort",
    tagline: "See how a data analytics cohort can be laid out on Zedu.",
    description:
      "This entry is an example built to demonstrate the cohort page layout. It is not a live programme and is not run by Zedu or any organisation.",
    format: "Online · 8 weeks",
    startDate: "January 2027",
    objectives: [
      "Practise querying and cleaning real-world datasets",
      "Build and present an end-to-end analysis",
      "Share weekly findings with the cohort",
    ],
    status: "upcoming",
    kind: "example",
  },
  {
    slug: "example-ux-design-fellowship",
    title: "Example UX Design Fellowship",
    tagline: "A demo design fellowship page showing Zedu's cohort layout.",
    description:
      "Placeholder content for layout purposes only — nothing on this page describes a real programme or a Zedu customer.",
    format: "Online · 6 weeks",
    startDate: "February 2027",
    objectives: [
      "Research user needs and turn them into design briefs",
      "Prototype and test interfaces with quick feedback loops",
      "Present a capstone design to the cohort",
    ],
    status: "upcoming",
    kind: "example",
  },
  {
    slug: "example-software-engineering-bootcamp",
    title: "Example Software Engineering Bootcamp",
    tagline: "A sample engineering bootcamp page — layout demo only.",
    description:
      "Example content used to show how a software engineering cohort appears on Zedu. It is not a live programme and does not represent a real organisation.",
    format: "Online · 12 weeks",
    startDate: "March 2027",
    objectives: [
      "Ship small features in reviewable increments",
      "Practise testing, review, and collaboration habits",
      "Build and demo a team project at the end",
    ],
    status: "upcoming",
    kind: "example",
  },
];

/** Looks up a registry entry by its public slug. */
export function getCohortBySlug(slug: string): Cohort | undefined {
  return cohorts.find((cohort) => cohort.slug === slug);
}

/** Primary CTA target for a cohort, falling back to `/auth/sign-up`. */
export function primaryCtaUrl(cohort: Cohort): string {
  return cohort.ctaUrl ?? DEFAULT_CTA_URL;
}

/** Secondary CTA target for a cohort, falling back to `/contact-sales`. */
export function secondaryCtaUrl(cohort: Cohort): string {
  return cohort.secondaryCtaUrl ?? DEFAULT_SECONDARY_CTA_URL;
}
