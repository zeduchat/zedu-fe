import type { Metadata } from "next";
import { Github } from "lucide-react";
import { teamMembers } from "~/data/team";

export const metadata: Metadata = {
  title: "Team",
  description:
    "Meet the people behind Zedu and explore the team's GitHub profiles.",
  alternates: {
    canonical: "/team",
  },
};

const getInitials = (name: string) =>
  name
    .split(/[ ,]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

export default function TeamPage() {
  return (
    <main className="min-h-[70vh] px-4 pb-20 pt-10 sm:px-8 sm:pt-16 lg:px-12">
      <section className="mx-auto w-full max-w-7xl">
        <header className="mb-10 max-w-2xl sm:mb-14">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-primary-500">
            The people behind Zedu
          </p>
          <h1 className="text-3xl font-semibold leading-tight text-neutral-900 sm:text-4xl md:text-5xl">
            Meet our team
          </h1>
          <p className="mt-4 text-base leading-relaxed text-neutral-600 sm:text-lg">
            We are a team building better ways for learning communities to
            connect, collaborate, and grow. Get to know the people behind the
            work and explore their GitHub profiles.
          </p>
        </header>

        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {teamMembers.map((member) => (
            <li
              key={member.github}
              className="flex min-h-36 flex-col justify-between gap-5 rounded-lg border border-neutral-200 bg-white p-5 transition-colors hover:border-primary-300"
            >
              <div className="flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary-50 text-sm font-semibold text-primary-500"
                >
                  {getInitials(member.name)}
                </span>
                <h2 className="text-base font-semibold leading-snug text-neutral-900">
                  {member.name}
                </h2>
              </div>
              <a
                href={`https://github.com/${member.github}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex w-fit items-center gap-2 text-sm font-medium text-neutral-600 transition-colors hover:text-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-500"
                aria-label={`${member.name} on GitHub, opens in a new tab`}
              >
                <Github aria-hidden="true" className="size-4" />
                {member.github}
              </a>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
