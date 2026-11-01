import type { Metadata } from "next";
import { ogImageUrl, siteUrl } from "~/lib/env-urls";

export { default } from "../_components/cohorts/cohorts-list-page";

const canonicalUrl = siteUrl("/cohorts");

const description =
  "Browse public cohort pages on Zedu, view format and start dates, and start your own shareable cohort workspace.";

/**
 * Static metadata for the pre-login cohort directory at `/cohorts`. The
 * layout title template renders this as "Active Cohorts on Zedu | Zedu".
 */
export const metadata: Metadata = {
  title: "Active Cohorts on Zedu",
  description,
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title: "Active Cohorts on Zedu | Zedu",
    description,
    url: canonicalUrl,
    siteName: "Zedu",
    type: "website",
    images: [
      {
        url: ogImageUrl("og-image-5.png"),
        width: 1200,
        height: 630,
        alt: "Zedu learning platform for educators and cohorts",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Active Cohorts on Zedu | Zedu",
    description,
    images: [ogImageUrl("og-image-5.png")],
  },
  robots: { index: true, follow: true },
};
