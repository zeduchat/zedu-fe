import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ogImageUrl, siteUrl } from "~/lib/env-urls";
import {
  cohorts,
  getCohortBySlug,
  primaryCtaUrl,
  secondaryCtaUrl,
} from "../../_lib/cohorts";
import { ArrowBtn, OutlineBtn } from "../ui/Button";
import { CohortExampleBadge, CohortStatusBadge } from "./cohort-badges";
import { CohortCtaBand } from "./cohort-cta-band";
import { ShareRow } from "./share-row";

type PageProps = { params: Promise<{ slug: string }> };

const ogImage = {
  url: ogImageUrl("og-image-5.png"),
  width: 1200,
  height: 630,
  alt: "Zedu learning platform for educators and cohorts",
};

/**
 * Generates per-cohort metadata: self-canonical URL, OG/Twitter cards, and
 * a `noindex` robots tag for example entries.
 */
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const cohort = getCohortBySlug(slug);
  if (!cohort) notFound();

  const canonical = siteUrl(`/cohorts/${cohort.slug}`);
  const description = cohort.tagline;
  const cardTitle = `${cohort.title} | Zedu`;

  return {
    title: cohort.title,
    description,
    alternates: { canonical },
    openGraph: {
      title: cardTitle,
      description,
      url: canonical,
      siteName: "Zedu",
      type: "website",
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title: cardTitle,
      description,
      images: [ogImage.url],
    },
    ...(cohort.kind === "example"
      ? { robots: { index: false, follow: true } }
      : { robots: { index: true, follow: true } }),
  };
}

/** Pre-renders one static page per registry entry. */
export const generateStaticParams = () =>
  cohorts.map((cohort) => ({ slug: cohort.slug }));

/** Public cohort landing page rendered from the static registry. */
export default async function CohortDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const cohort = getCohortBySlug(slug);
  if (!cohort) notFound();

  const canonicalUrl = siteUrl(`/cohorts/${cohort.slug}`);
  // Example entries never emit JSON-LD rather than publishing fake course
  // data; the real entry gets a plain schema.org Course with no invented
  // ratings, dates, or offers.
  const courseJsonLd = JSON.stringify({
    "@context": ["https:", "schema.org"].join("//"),
    "@type": "Course",
    name: cohort.title,
    description: cohort.description,
    provider: { name: "Zedu" },
    url: canonicalUrl,
  }).replace(/</g, "\\u003c");

  return (
    <>
      {cohort.kind === "real" && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: courseJsonLd }}
        />
      )}
      <section className="relative isolate overflow-hidden px-4 py-10 sm:px-6 sm:py-14 lg:px-10 lg:py-16">
        <div className="mx-auto max-w-4xl space-y-6">
          <Link
            href="/cohorts"
            className="inline-flex items-center gap-1.5 rounded font-medium text-primary-500 transition-colors hover:text-primary-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
            All cohorts
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <CohortStatusBadge status={cohort.status} />
            <CohortExampleBadge kind={cohort.kind} />
          </div>
          <h1 className="text-3xl font-semibold leading-tight text-[#1f2530] sm:text-4xl lg:text-[44px] lg:leading-[1.12]">
            {cohort.title}
          </h1>
          <p className="max-w-3xl text-xl leading-relaxed text-gray-600">
            {cohort.tagline}
          </p>
          <p className="max-w-3xl text-base leading-relaxed text-gray-600">
            {cohort.description}
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <ArrowBtn text="Get started" href={primaryCtaUrl(cohort)} />
            <OutlineBtn text="Request access" href={secondaryCtaUrl(cohort)} />
          </div>
        </div>
      </section>

      <section className="relative isolate overflow-hidden space-y-6 px-4 pb-10 sm:px-6 sm:pb-14 lg:px-10 lg:pb-16">
        <div className="mx-auto max-w-4xl space-y-8">
          <div className="space-y-4">
            <h2 className="text-3xl font-semibold leading-tight text-[#1f2530] sm:text-4xl">
              Programme details
            </h2>
            <dl className="flex flex-wrap gap-4">
              <div className="min-w-56 flex-1 rounded-2xl border border-gray-200 bg-white p-4">
                <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Format
                </dt>
                <dd className="mt-1 text-base font-medium text-[#1f2530]">
                  {cohort.format}
                </dd>
              </div>
              {cohort.startDate && (
                <div className="min-w-56 flex-1 rounded-2xl border border-gray-200 bg-white p-4">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Start date
                  </dt>
                  <dd className="mt-1 text-base font-medium text-[#1f2530]">
                    {cohort.startDate}
                  </dd>
                </div>
              )}
              {cohort.instructor && (
                <div className="min-w-56 flex-1 rounded-2xl border border-gray-200 bg-white p-4">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Instructor
                  </dt>
                  <dd className="mt-1 text-base font-medium text-[#1f2530]">
                    {cohort.instructor.name}{" "}
                    <span className="font-normal text-gray-500">
                      — {cohort.instructor.role}
                    </span>
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {cohort.objectives && cohort.objectives.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-3xl font-semibold leading-tight text-[#1f2530] sm:text-4xl">
                Objectives
              </h2>
              <ul className="space-y-3">
                {cohort.objectives.map((objective) => (
                  <li
                    key={objective}
                    className="flex gap-3 text-base leading-relaxed text-gray-600"
                  >
                    <span
                      aria-hidden="true"
                      className="mt-2.5 size-1.5 shrink-0 rounded-full bg-primary-500"
                    />
                    {objective}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="space-y-4">
            <h2 className="text-3xl font-semibold leading-tight text-[#1f2530] sm:text-4xl">
              Share this page
            </h2>
            <ShareRow title={cohort.title} url={canonicalUrl} />
          </div>
        </div>
      </section>

      <CohortCtaBand
        heading="Run your next cohort on Zedu"
        description="Set up channels, schedules, and updates for your learning community in one workspace."
      />
    </>
  );
}
