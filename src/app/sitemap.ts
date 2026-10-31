import type { MetadataRoute } from "next";
import { siteUrl } from "~/lib/env-urls";
import { TEMPLATES } from "~/data/templates";

// Public routes only. Auth workflows and private workspace routes are excluded.
const PAGES: { path: string; priority: number }[] = [
  { path: "/", priority: 1 },
  { path: "/account", priority: 0.5 },
  { path: "/pricing", priority: 0.9 },
  { path: "/about", priority: 0.8 },
  { path: "/solutions/bootcamps", priority: 0.8 },
  { path: "/solutions/schools", priority: 0.8 },
  { path: "/solutions/universities", priority: 0.8 },
  { path: "/products/channels", priority: 0.7 },
  { path: "/products/buzz", priority: 0.7 },
  { path: "/products/file-management", priority: 0.7 },
  { path: "/download", priority: 0.6 },
  { path: "/contact-sales", priority: 0.6 },
  { path: "/resources", priority: 0.6 },
  { path: "/templates", priority: 0.5 },
  ...TEMPLATES.map(({ slug }) => ({
    path: `/templates/${slug}`,
    priority: 0.5,
  })),
  { path: "/auth/login", priority: 0.5 },
  { path: "/auth/sign-up", priority: 0.5 },
  { path: "/contributors", priority: 0.4 },
  { path: "/contributors/zedu-weaver", priority: 0.4 },
  { path: "/contributors/zedu-toucan", priority: 0.4 },
  { path: "/contributors/zedu-quetzal", priority: 0.4 },
  { path: "/contributors/zedu-osprey", priority: 0.4 },
  { path: "/contributors/zedu-kestrel", priority: 0.4 },
  { path: "/contributors/macaw", priority: 0.4 },
  { path: "/contributors/lark", priority: 0.4 },
  { path: "/contributors/ibis", priority: 0.4 },
  { path: "/contributors/heron", priority: 0.4 },
  { path: "/contributors/egrets", priority: 0.4 },
  { path: "/contributors/sparrow", priority: 0.4 },
  { path: "/contributors/zedu-condor", priority: 0.4 },
  { path: "/contributors/zedu-drongo", priority: 0.4 },
  { path: "/contributors/zedu-flamingo", priority: 0.4 },
  { path: "/contributors/zedu-gannet", priority: 0.4 },
  { path: "/contributors/zedu-jacana", priority: 0.4 },
  { path: "/policy", priority: 0.3 },
  { path: "/terms-of-service", priority: 0.3 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  return PAGES.map(({ path, priority }) => ({
    url: path === "/" ? base : `${base}${path}`,
    changeFrequency: "weekly",
    priority,
  }));
}
