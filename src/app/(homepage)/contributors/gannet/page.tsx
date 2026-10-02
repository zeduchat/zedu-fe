import { Metadata } from "next";
import { ogImageUrl, siteUrl } from "~/lib/env-urls";
import { DynamicFooter } from "../../_components/footer/dynamic-footer";
import { Users, Sparkles, Rocket } from "lucide-react";

export const metadata: Metadata = {
  title: "Team Gannet Contributors",
  description:
    "Meet Team Gannet - the people who set up, run, and improve Zedu during HNG 15.",
  icons: {
    icon: "/TelexIcon.svg",
  },
  openGraph: {
    title: "Team Gannet Contributors | Zedu",
    description:
      "Meet Team Gannet - the people who set up, run, and improve Zedu during HNG 15.",
    url: siteUrl("/contributors/gannet"),
    siteName: "Zedu",
    images: [
      {
        url: ogImageUrl("og-image-5.png"),
        width: 1200,
        height: 630,
        alt: "Team Gannet contributors for Zedu",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Team Gannet Contributors | Zedu",
    description:
      "Meet Team Gannet - the people who set up, run, and improve Zedu during HNG 15.",
    images: [ogImageUrl("og-image-5.png")],
  },
  alternates: {
    canonical: siteUrl("/contributors/gannet"),
  },
};

const contributors = [
  {
    name: "Adeola Balogun",
    role: "Product Engineer",
    contribution: "Marketing & workspace UI",
  },
  {
    name: "Chinedu Okafor",
    role: "Product Engineer",
    contribution: "Realtime messaging APIs",
  },
  {
    name: "Fatima Yusuf",
    role: "Product Engineer",
    contribution: "Design system & UX flows",
  },
  {
    name: "Emeka Nwosu",
    role: "Product Engineer",
    contribution: "CI/CD & cloud infrastructure",
  },
  {
    name: "Ngozi Adeyemi",
    role: "Product Engineer",
    contribution: "End-to-end test coverage",
  },
];

const highlights = [
  {
    Icon: Rocket,
    title: "Set up",
    desc: "Stood up the environments, tooling, and pipelines that Zedu runs on.",
  },
  {
    Icon: Users,
    title: "Run",
    desc: "Kept releases, reviews, and standups moving through the HNG 15 sprint.",
  },
  {
    Icon: Sparkles,
    title: "Improve",
    desc: "Shipped polish, fixes, and features that made the product better every day.",
  },
];

const initialsOf = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

const GannetContributorsPage = () => {
  return (
    <div className="space-y-16 sm:space-y-20">
      <section className="relative isolate flex w-full flex-col items-center gap-4 overflow-hidden px-4 py-10 text-center sm:gap-6 sm:px-8 sm:py-16 lg:gap-8 lg:px-12 mt-10">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[30%] bg-gradient-to-t from-blue-50/30 to-white"
        />
        <span className="inline-flex items-center gap-2 rounded-full border border-primary-100 bg-primary-50 px-3 py-1 text-xs font-medium text-primary-500 sm:text-sm">
          <Sparkles size={14} />
          HNG 15 · Team Gannet
        </span>
        <h1 className="text-2xl font-semibold leading-tight text-neutral-900 sm:text-4xl md:text-5xl text-center">
          Team Gannet <span className="text-primary-500">Contributors</span>
        </h1>
        <p className="max-w-[95%] text-xs text-neutral-600 sm:max-w-[90%] sm:text-base md:max-w-[65%] lg:max-w-[50%] lg:text-lg">
          The people who would set up, run, and improve Zedu as Team Gannet
          during HNG 15 — building the workspaces, tools, and experiences that
          make structured learning possible.
        </p>

        <div className="grid w-full max-w-5xl grid-cols-1 gap-4 pt-4 sm:grid-cols-3">
          {highlights.map(({ Icon, title, desc }) => (
            <article
              key={title}
              className="flex h-full flex-col items-center gap-3 rounded-xl border border-neutral-200 bg-white p-5 text-center transition-shadow hover:shadow-md"
            >
              <span className="flex size-10 items-center justify-center rounded-full bg-primary-50 text-primary-500">
                <Icon size={18} />
              </span>
              <h2 className="text-base font-semibold text-neutral-900 sm:text-lg">
                {title}
              </h2>
              <p className="text-sm leading-relaxed text-neutral-600">{desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="w-full px-4 sm:px-8 lg:px-12">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-3 text-center">
          <h2 className="text-xl font-semibold leading-tight text-neutral-900 sm:text-3xl md:text-4xl">
            The Team
          </h2>
          <p className="max-w-2xl text-sm text-neutral-600 sm:text-base">
            Five of the contributors who kept Zedu shipping throughout the
            program.
          </p>
        </div>

        <div className="mx-auto mt-8 w-full max-w-4xl overflow-hidden rounded-xl border border-neutral-200">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <caption className="sr-only">
                Team Gannet contributors and their contributions to Zedu during
                HNG 15
              </caption>
              <thead className="bg-blue-50/30">
                <tr>
                  <th
                    scope="col"
                    className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-neutral-500 sm:px-6"
                  >
                    Contributor
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-neutral-500 sm:px-6"
                  >
                    Role
                  </th>
                  <th
                    scope="col"
                    className="hidden px-4 py-3 text-xs font-semibold uppercase tracking-wide text-neutral-500 sm:table-cell sm:px-6"
                  >
                    Contribution
                  </th>
                </tr>
              </thead>
              <tbody>
                {contributors.map((person) => (
                  <tr
                    key={person.name}
                    className="border-t border-neutral-200 transition-colors hover:bg-neutral-50"
                  >
                    <td className="px-4 py-3 sm:px-6">
                      <div className="flex items-center gap-3">
                        <span
                          aria-hidden="true"
                          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-main-gradient text-xs font-semibold text-white"
                        >
                          {initialsOf(person.name)}
                        </span>
                        <span className="text-sm font-medium text-neutral-900 sm:text-base">
                          {person.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-600 sm:px-6">
                      {person.role}
                    </td>
                    <td className="hidden px-4 py-3 text-sm text-neutral-600 sm:table-cell sm:px-6">
                      {person.contribution}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <DynamicFooter
        text="Built by a team, powered by learning"
        description="Team Gannet keeps Zedu organized, reliable, and ready for every cohort that learns on it."
      />
    </div>
  );
};

export default GannetContributorsPage;
