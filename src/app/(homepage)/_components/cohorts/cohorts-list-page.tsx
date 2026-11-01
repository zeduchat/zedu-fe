import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { cohorts } from "../../_lib/cohorts";
import { ArrowBtn, OutlineBtn } from "../ui/Button";
import { CohortExampleBadge, CohortStatusBadge } from "./cohort-badges";
import { CohortCtaBand } from "./cohort-cta-band";

const viewDetailsClassName =
  "inline-flex items-center gap-1.5 rounded font-medium text-primary-500 transition-colors hover:text-primary-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2";

function ViewDetailsLink({ slug, title }: { slug: string; title: string }) {
  return (
    <Link
      href={`/cohorts/${slug}`}
      aria-label={`View details for ${title}`}
      className={viewDetailsClassName}
    >
      View details
      <ArrowRight aria-hidden="true" className="size-4" />
    </Link>
  );
}

/**
 * Pre-login cohort directory at `/cohorts`. Renders every registry entry
 * exactly once — a table on desktop and stacked cards on mobile.
 */
export default function CohortsListPage() {
  return (
    <>
      <section className="relative isolate overflow-hidden px-4 py-10 sm:px-6 sm:py-14 lg:px-10 lg:py-16">
        <div className="mx-auto max-w-4xl space-y-5">
          <h1 className="text-3xl font-semibold leading-tight text-[#1f2530] sm:text-4xl lg:text-[44px] lg:leading-[1.12]">
            Active Cohorts on Zedu
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-gray-600 sm:text-lg">
            Every entry below has a public page you can open without signing in.
            Example entries are clearly marked — they are not live programmes.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <ArrowBtn text="Start your own cohort" href="/auth/sign-up" />
            <OutlineBtn text="Talk to us" href="/contact-sales" />
          </div>
        </div>
      </section>

      <section className="relative isolate overflow-hidden px-4 pb-10 sm:px-6 sm:pb-14 lg:px-10 lg:pb-16">
        <div className="mx-auto max-w-5xl space-y-6">
          <h2 className="text-3xl font-semibold leading-tight text-[#1f2530] sm:text-4xl">
            Browse cohorts
          </h2>
          {cohorts.length === 0 ? (
            <p className="text-base text-gray-600">
              No cohorts are listed yet.
            </p>
          ) : (
            <>
              <div className="hidden overflow-x-auto rounded-2xl border border-gray-200 bg-white md:block">
                <table className="w-full border-collapse text-left">
                  <caption className="sr-only">Cohorts listed on Zedu</caption>
                  <thead>
                    <tr className="border-b border-gray-200 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      <th scope="col" className="px-4 py-3">
                        Cohort
                      </th>
                      <th scope="col" className="px-4 py-3">
                        Format
                      </th>
                      <th scope="col" className="px-4 py-3">
                        Start date
                      </th>
                      <th scope="col" className="px-4 py-3">
                        Status
                      </th>
                      <th scope="col" className="px-4 py-3">
                        <span className="sr-only">Details</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {cohorts.map((cohort) => (
                      <tr key={cohort.slug} className="align-top">
                        <th
                          scope="row"
                          className="px-4 py-4 text-base font-semibold text-[#1f2530]"
                        >
                          <span className="flex flex-col items-start gap-1.5">
                            <span>{cohort.title}</span>
                            <CohortExampleBadge kind={cohort.kind} />
                          </span>
                        </th>
                        <td className="px-4 py-4 text-gray-600">
                          {cohort.format}
                        </td>
                        <td className="px-4 py-4 text-gray-600">
                          {cohort.startDate ?? "Not announced"}
                        </td>
                        <td className="px-4 py-4">
                          <CohortStatusBadge status={cohort.status} />
                        </td>
                        <td className="px-4 py-4">
                          <ViewDetailsLink
                            slug={cohort.slug}
                            title={cohort.title}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <ul className="space-y-3 md:hidden">
                {cohorts.map((cohort) => (
                  <li
                    key={cohort.slug}
                    className="rounded-2xl border border-gray-200 bg-white p-4"
                  >
                    <div className="flex flex-col items-start gap-1.5">
                      <span className="text-base font-semibold text-[#1f2530]">
                        {cohort.title}
                      </span>
                      <CohortExampleBadge kind={cohort.kind} />
                    </div>
                    <dl className="mt-3 space-y-1.5 text-sm text-gray-600">
                      <div className="flex gap-2">
                        <dt className="font-medium text-gray-500">Format:</dt>
                        <dd>{cohort.format}</dd>
                      </div>
                      <div className="flex gap-2">
                        <dt className="font-medium text-gray-500">
                          Start date:
                        </dt>
                        <dd>{cohort.startDate ?? "Not announced"}</dd>
                      </div>
                    </dl>
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                      <CohortStatusBadge status={cohort.status} />
                      <ViewDetailsLink
                        slug={cohort.slug}
                        title={cohort.title}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </section>

      <CohortCtaBand
        heading="Ready to launch your cohort?"
        description="Create your Zedu workspace and give learners one place to learn together."
      />
    </>
  );
}
