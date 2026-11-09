import type { Metadata } from "next";
import {
  Bell,
  BookOpenCheck,
  CalendarClock,
  MessageCircle,
  ShieldCheck,
} from "lucide-react";
import { ogImageUrl, siteUrl } from "~/lib/env-urls";
import { ArrowBtn, OutlineBtn } from "~/app/(homepage)/_components/ui/Button";

export const metadata: Metadata = {
  title: {
    absolute: "Zedu for Parents and Guardians | Stay Connected to School",
  },
  description:
    "Keep up with your child's school life. Zedu helps parents and guardians follow assignments, deadlines, announcements, and teacher communication in one place.",
  keywords: [
    "Zedu for parents",
    "Zedu for guardians",
    "school communication for parents",
    "school announcements for families",
    "parent assignment updates",
    "school family communication",
  ],
  openGraph: {
    title: "Zedu for Parents and Guardians | Stay Connected to School",
    description:
      "A clear place for parents and guardians to follow school announcements, assignments, deadlines, and messages from teachers.",
    url: siteUrl("/for/parents"),
    siteName: "Zedu",
    images: [
      {
        url: ogImageUrl("og-image-5.png"),
        width: 1200,
        height: 630,
        alt: "Zedu helps parents and guardians stay connected to school",
      },
    ],
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Zedu for Parents and Guardians | Stay Connected to School",
    description:
      "Follow school announcements, assignments, deadlines, and teacher communication in one place with Zedu.",
    images: [ogImageUrl("og-image-5.png")],
  },
  alternates: {
    canonical: siteUrl("/for/parents"),
  },
  robots: {
    index: true,
    follow: true,
  },
};

const parentFeatures = [
  {
    icon: BookOpenCheck,
    title: "Assignments with context",
    description:
      "See the work teachers share and where to find the instructions or resources your child needs.",
  },
  {
    icon: CalendarClock,
    title: "Deadlines to plan around",
    description:
      "Keep upcoming due dates and class activities in view, so school tasks are easier to plan for at home.",
  },
  {
    icon: Bell,
    title: "Announcements that stand out",
    description:
      "Find school and classroom updates without digging through unrelated chats or messages.",
  },
  {
    icon: MessageCircle,
    title: "A clearer line to school",
    description:
      "Follow communication shared by teachers and school teams in the right class or school space.",
  },
];

const steps = [
  {
    number: "01",
    title: "Your school invites your family",
    description:
      "A school using Zedu shares access with parents and guardians through its usual onboarding process.",
  },
  {
    number: "02",
    title: "Check updates in one place",
    description:
      "Open the spaces your school shares with you to catch announcements, assignments, and important dates.",
  },
  {
    number: "03",
    title: "Stay in the loop together",
    description:
      "Use the information from school to support your child's learning and know when to follow up.",
  },
];

const ParentsPage = () => {
  return (
    <main>
      <section className="relative isolate overflow-hidden px-4 py-10 sm:px-6 sm:py-14 lg:px-10 lg:py-16">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 left-1/2 -z-10 h-[55%] w-screen -translate-x-1/2 bg-gradient-to-t from-blue-50/50 to-white"
        />
        <div className="mx-auto grid w-full max-w-7xl items-center gap-10 px-1 py-8 sm:px-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-14 lg:px-10 lg:py-12">
          <div className="flex flex-col items-center gap-5 text-center lg:items-start lg:text-left">
            <span className="rounded-full border border-primary-500/20 bg-primary-500/5 px-4 py-1.5 text-sm font-medium text-primary-500">
              For parents and guardians
            </span>
            <h1 className="max-w-[14ch] text-3xl font-semibold leading-tight text-[#1f2530] sm:text-4xl lg:text-[48px] lg:leading-[1.12]">
              Feel closer to your child&apos;s{" "}
              <span className="text-primary-500">school day.</span>
            </h1>
            <p className="max-w-[48ch] text-sm leading-relaxed text-[#5a6170] sm:text-base">
              Zedu gives parents and guardians a clear place to follow school
              announcements, assignments, deadlines, and teacher communication —
              without needing to manage a school workspace.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 lg:justify-start">
              <ArrowBtn
                text="Bring Zedu to your school"
                href="/contact-sales"
              />
              <OutlineBtn
                text="See how it works"
                href="#how-it-works"
                className="text-primary-500"
              />
            </div>
            <p className="max-w-[48ch] text-xs leading-relaxed text-[#8a90a0]">
              Your school needs to use Zedu and invite your family before you
              can see its updates.
            </p>
          </div>

          <div className="mx-auto w-full max-w-xl rounded-3xl border border-[#E8E8F4] bg-white p-4 shadow-[0_24px_70px_rgba(48,48,115,0.12)] sm:p-6">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-[#1f2530]">
                  Your family&apos;s school updates
                </p>
                <p className="mt-1 text-xs text-[#8a90a0]">
                  An example of what you might see
                </p>
              </div>
              <span className="rounded-full bg-[#F0EDFF] px-3 py-1 text-xs font-medium text-primary-500">
                This week
              </span>
            </div>

            <div className="space-y-3">
              <article className="flex items-start gap-3 rounded-2xl bg-[#F7F6FF] p-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-primary-500">
                  <Bell aria-hidden="true" size={19} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium uppercase tracking-wide text-primary-500">
                    School announcement
                  </p>
                  <h2 className="mt-1 text-sm font-semibold text-[#1f2530]">
                    Science fair sign-up closes Friday
                  </h2>
                  <p className="mt-1 text-xs text-[#73798a]">
                    Shared by the school team
                  </p>
                </div>
                <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-primary-500">
                  New
                </span>
              </article>

              <article className="flex items-start gap-3 rounded-2xl border border-[#ECEBF5] p-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#F7F6FF] text-primary-500">
                  <BookOpenCheck aria-hidden="true" size={19} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium uppercase tracking-wide text-[#73798a]">
                    Assignment
                  </p>
                  <h2 className="mt-1 text-sm font-semibold text-[#1f2530]">
                    Maths worksheet · Chapter 4
                  </h2>
                  <p className="mt-1 text-xs text-[#73798a]">
                    Shared by the class teacher
                  </p>
                </div>
                <span className="whitespace-nowrap rounded-full bg-[#FFF6E5] px-2.5 py-1 text-[11px] font-medium text-[#966400]">
                  Due Thu
                </span>
              </article>

              <article className="flex items-start gap-3 rounded-2xl border border-[#ECEBF5] p-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#F7F6FF] text-primary-500">
                  <MessageCircle aria-hidden="true" size={19} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium uppercase tracking-wide text-[#73798a]">
                    From the class teacher
                  </p>
                  <h2 className="mt-1 text-sm font-semibold text-[#1f2530]">
                    A quick note about next week&apos;s trip
                  </h2>
                  <p className="mt-1 text-xs text-[#73798a]">
                    Class updates stay with the class
                  </p>
                </div>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section className="relative isolate overflow-hidden space-y-8 px-4 py-10 sm:px-6 sm:py-14 lg:px-10 lg:py-16">
        <div className="mx-auto max-w-3xl space-y-3 text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary-500">
            Less searching, more knowing
          </p>
          <h2 className="text-3xl font-semibold leading-tight text-[#1f2530] sm:text-4xl">
            The school details you need,{" "}
            <span className="text-primary-500">easier to find.</span>
          </h2>
          <p className="mx-auto max-w-[62ch] text-sm leading-relaxed text-[#5a6170] sm:text-base">
            Keep the everyday details close at hand, so you can support your
            child without chasing updates across different conversations.
          </p>
        </div>

        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {parentFeatures.map(({ icon: Icon, title, description }) => (
            <article
              key={title}
              className="rounded-2xl border border-[#ECEBF5] bg-white p-5 shadow-sm sm:p-6"
            >
              <span className="mb-5 flex size-11 items-center justify-center rounded-xl bg-[#F0EDFF] text-primary-500">
                <Icon aria-hidden="true" size={21} />
              </span>
              <h3 className="text-base font-semibold text-[#1f2530]">
                {title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#5a6170]">
                {description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section
        id="how-it-works"
        className="relative isolate overflow-hidden bg-[#F7F6FF] px-4 py-12 sm:px-6 sm:py-16 lg:px-10 lg:py-20"
      >
        <div className="mx-auto w-full max-w-7xl">
          <div className="mx-auto max-w-3xl space-y-3 text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-primary-500">
              A simple start
            </p>
            <h2 className="text-3xl font-semibold leading-tight text-[#1f2530] sm:text-4xl">
              How families get started with Zedu
            </h2>
            <p className="text-sm leading-relaxed text-[#5a6170] sm:text-base">
              Zedu is a shared space for your school community. Your school
              decides what to share and invites the right families.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-6 lg:mt-14 lg:gap-10">
            {steps.map((step) => (
              <article key={step.number} className="space-y-4">
                <span className="inline-flex size-11 items-center justify-center rounded-full bg-primary-500 text-sm font-semibold text-white">
                  {step.number}
                </span>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-[#1f2530]">
                    {step.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-[#5a6170]">
                    {step.description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6 sm:py-16 lg:px-10 lg:py-20">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-start gap-8 rounded-3xl bg-[#303073] px-6 py-9 text-white sm:px-10 sm:py-12 lg:flex-row lg:items-center lg:justify-between lg:px-14">
          <div className="max-w-2xl space-y-3">
            <span className="inline-flex items-center gap-2 text-sm font-medium text-[#DAD7FF]">
              <ShieldCheck aria-hidden="true" size={18} />
              Built around your school community
            </span>
            <h2 className="text-2xl font-semibold leading-tight sm:text-3xl">
              Want clearer school updates for your family?
            </h2>
            <p className="text-sm leading-relaxed text-white/80 sm:text-base">
              Ask your school if it uses Zedu. If it doesn&apos;t yet, help
              connect the school team with us.
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <ArrowBtn
              text="Contact the Zedu team"
              href="/contact-sales"
              className="justify-center whitespace-nowrap"
            />
            <OutlineBtn
              text="Explore Zedu for schools"
              href="/solutions/schools"
              className="justify-center whitespace-nowrap border-white text-white hover:border-primary-500"
            />
          </div>
        </div>
      </section>
    </main>
  );
};

export default ParentsPage;
