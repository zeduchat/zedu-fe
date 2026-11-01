import type { Metadata } from "next";
import { ogImageUrl, siteUrl } from "~/lib/env-urls";
import { ArrowBtn, OutlineBtn } from "~/app/(homepage)/_components/ui/Button";

export const metadata: Metadata = {
  title: "Migrate to Zedu",
  description:
    "Move your school, bootcamp or cohort from WhatsApp, Telegram or Google Classroom to Zedu. One structured workspace for announcements, classes and discussions.",
  keywords: [
    "migrate from WhatsApp",
    "migrate from Telegram",
    "Google Classroom alternative",
    "WhatsApp group alternative for schools",
    "bootcamp communication platform",
    "cohort communication tool",
    "Zedu migration",
  ],
  openGraph: {
    title: "Migrate to Zedu - Bring your learning community into one workspace",
    description:
      "Stop losing announcements in chat threads. Move your school, bootcamp or cohort to Zedu with structured channels, class spaces and clear updates.",
    url: siteUrl("/migrate"),
    siteName: "Zedu",
    images: [
      {
        url: ogImageUrl("og-image-5.png"),
        width: 1200,
        height: 630,
        alt: "Zedu migration page preview",
      },
    ],
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Migrate to Zedu - One workspace for your learning community",
    description:
      "Replace scattered chats with structured channels for announcements, classes and discussions. Book a demo or start free.",
    images: [ogImageUrl("og-image-5.png")],
  },
  alternates: {
    canonical: siteUrl("/migrate"),
  },
  robots: {
    index: true,
    follow: true,
  },
  category: "education",
  applicationName: "Zedu",
  creator: "Zedu",
  publisher: "Zedu",
};

const painPoints = [
  {
    title: "Announcements get buried",
    description:
      "A schedule change is posted between memes and good mornings, then disappears under a hundred new messages.",
  },
  {
    title: "Updates live in too many apps",
    description:
      "WhatsApp for reminders, Telegram for resources, Google Classroom for assignments, and email for everything else.",
  },
  {
    title: "New members miss the context",
    description:
      "People who join later cannot find the pinned document, the recording or the decision that was made last week.",
  },
];

const beforeItems = [
  "One endless chat for every class, cohort and announcement",
  "Questions and replies mixed into the same thread",
  "Important files lost in the media gallery",
  "Repeating the same update in three different apps",
];

const afterItems = [
  "A channel per class, topic or cohort with a clear purpose",
  "Threaded discussions so questions stay with their answers",
  "Shared files organised in folders everyone can find",
  "One workspace for announcements, lessons and follow-ups",
];

const benefits = [
  {
    title: "Structure from day one",
    description:
      "Set up channels for announcements, classes and support before you invite your first member.",
  },
  {
    title: "Fewer missed updates",
    description:
      "Members follow the spaces that matter to them, so important messages are not lost in noise.",
  },
  {
    title: "A calmer onboarding",
    description:
      "New learners land in the right channels with the context they need instead of a wall of messages.",
  },
  {
    title: "One place to teach and talk",
    description:
      "Chat, calls, files and AI support live in the same workspace as your community.",
  },
];

const steps = [
  {
    step: "1",
    title: "Bring your people over",
    description:
      "Invite your team by email and share one link. Roles keep teachers, admins and learners in the right places.",
  },
  {
    step: "2",
    title: "Mirror your structure",
    description:
      "Create a channel for each class or cohort, plus a shared announcement channel for the whole community.",
  },
  {
    step: "3",
    title: "Move the essentials",
    description:
      "Upload the documents, links and recordings people keep asking for, then pin them where everyone can find them.",
  },
];

const faqs = [
  {
    question: "Can we move our existing chat history?",
    answer:
      "WhatsApp and Telegram do not allow a full export into another platform. We help you keep the essentials by bringing over documents, pinned links and the important announcements, then starting fresh conversations in the right channels.",
  },
  {
    question: "Do we have to move everything at once?",
    answer:
      "No. Many teams start with one cohort or programme, get comfortable with the structure, and then move the rest of the community when they are ready.",
  },
  {
    question: "Is Zedu only for schools?",
    answer:
      "Zedu is built for learning communities: schools, bootcamps, universities and training programmes. If you run cohorts and need clear communication, it fits.",
  },
  {
    question: "How long does setup take?",
    answer:
      "A basic workspace with channels, members and your first announcement can be ready in an afternoon. Larger institutions can book a demo and we will plan the rollout with you.",
  },
  {
    question: "What happens to our Google Classroom content?",
    answer:
      "You can keep using Classroom for graded coursework while Zedu handles communication, discussion and day-to-day coordination. Or move your class resources into Zedu channels and folders so everything lives in one place.",
  },
];

// schema.org's fixed vocabulary identifier required by JSON-LD (not a Zedu
// URL, so it is not an environment value).
const SCHEMA_CONTEXT = ["https:", "schema.org"].join("//");

const jsonLd = {
  "@context": SCHEMA_CONTEXT,
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer,
    },
  })),
};

const MigratePage = () => {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <section className="relative isolate overflow-hidden px-4 py-10 sm:px-6 sm:py-14 lg:px-10 lg:py-16">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 left-1/2 -z-10 h-[30%] w-screen -translate-x-1/2 bg-gradient-to-t from-blue-50/30 to-white"
        />
        <div className="relative mx-auto flex w-full max-w-4xl flex-col items-center gap-6 rounded-[28px] px-5 py-10 text-center sm:px-8 lg:py-16">
          <span className="rounded-full border border-primary-500/30 bg-blue-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-primary-500">
            Migrating to Zedu
          </span>
          <h1 className="text-3xl font-semibold leading-tight text-[#1f2530] sm:text-4xl lg:text-[52px] lg:leading-[1.08]">
            Bring your learning community out of{" "}
            <span className="text-primary-500">scattered chats</span>
          </h1>
          <p className="max-w-[62ch] text-sm leading-relaxed text-[#5a6170] sm:text-base lg:text-lg">
            WhatsApp, Telegram and Google Classroom kept everyone connected.
            Zedu keeps everyone organised. Move announcements, class discussions
            and shared files into one workspace built for cohorts and schools.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <ArrowBtn text="Book a Demo" href="/contact-sales" />
            <OutlineBtn text="Start for Free" href="/auth/sign-up" />
          </div>
          <p className="text-xs text-[#8a90a0] sm:text-sm">
            No credit card required to start. Migration support included for
            teams on paid plans.
          </p>
        </div>
      </section>

      <section className="px-4 py-10 sm:px-6 sm:py-14 lg:px-10">
        <div className="mx-auto w-full max-w-7xl space-y-8">
          <div className="max-w-3xl space-y-3">
            <h2 className="text-2xl font-semibold leading-tight text-[#1f2530] sm:text-3xl">
              The hidden cost of scattered tools
            </h2>
            <p className="text-sm leading-relaxed text-[#5a6170] sm:text-base">
              Chat apps are built for conversation, not for running a cohort.
              The cracks show up slowly, then all at once.
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {painPoints.map((point) => (
              <article
                key={point.title}
                className="rounded-2xl border border-[#e7e9f0] bg-white p-6 shadow-sm"
              >
                <h3 className="text-base font-semibold text-[#1f2530] sm:text-lg">
                  {point.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#5a6170]">
                  {point.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-10 sm:px-6 sm:py-14 lg:px-10">
        <div className="mx-auto w-full max-w-7xl rounded-[28px] bg-blue-50/60 px-5 py-10 sm:px-8 lg:px-12 lg:py-14">
          <div className="max-w-3xl space-y-3">
            <h2 className="text-2xl font-semibold leading-tight text-[#1f2530] sm:text-3xl">
              Before and after the move
            </h2>
            <p className="text-sm leading-relaxed text-[#5a6170] sm:text-base">
              Same people, same energy, clearer place to work.
            </p>
          </div>
          <div className="mt-8 grid gap-5 lg:grid-cols-2">
            <div className="rounded-2xl border border-[#e7e9f0] bg-white p-6 sm:p-8">
              <h3 className="text-lg font-semibold text-[#ec6b5f]">
                Before Zedu
              </h3>
              <ul className="mt-4 space-y-3">
                {beforeItems.map((item) => (
                  <li
                    key={item}
                    className="flex gap-3 text-sm leading-relaxed text-[#5a6170]"
                  >
                    <span
                      aria-hidden="true"
                      className="mt-2 size-1.5 shrink-0 rounded-full bg-[#ec6b5f]"
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-primary-500/20 bg-white p-6 sm:p-8">
              <h3 className="text-lg font-semibold text-primary-500">
                With Zedu
              </h3>
              <ul className="mt-4 space-y-3">
                {afterItems.map((item) => (
                  <li
                    key={item}
                    className="flex gap-3 text-sm leading-relaxed text-[#5a6170]"
                  >
                    <span
                      aria-hidden="true"
                      className="mt-2 size-1.5 shrink-0 rounded-full bg-primary-500"
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-10 sm:px-6 sm:py-14 lg:px-10">
        <div className="mx-auto w-full max-w-7xl space-y-8">
          <div className="max-w-3xl space-y-3">
            <h2 className="text-2xl font-semibold leading-tight text-[#1f2530] sm:text-3xl">
              Built for learning teams, not group chats
            </h2>
            <p className="text-sm leading-relaxed text-[#5a6170] sm:text-base">
              Everything you wished the group chat could do, in one place.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((benefit) => (
              <article
                key={benefit.title}
                className="rounded-2xl border border-[#e7e9f0] bg-white p-6 shadow-sm"
              >
                <h3 className="text-base font-semibold text-[#1f2530]">
                  {benefit.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#5a6170]">
                  {benefit.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-10 sm:px-6 sm:py-14 lg:px-10">
        <div className="mx-auto w-full max-w-7xl space-y-8">
          <div className="max-w-3xl space-y-3">
            <h2 className="text-2xl font-semibold leading-tight text-[#1f2530] sm:text-3xl">
              How the migration works
            </h2>
            <p className="text-sm leading-relaxed text-[#5a6170] sm:text-base">
              Three steps, at your pace. You do not have to move everything on
              the first day.
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {steps.map((step) => (
              <article
                key={step.step}
                className="rounded-2xl border border-[#e7e9f0] bg-white p-6 shadow-sm"
              >
                <span className="flex size-10 items-center justify-center rounded-full bg-primary-500 text-sm font-semibold text-white">
                  {step.step}
                </span>
                <h3 className="mt-4 text-base font-semibold text-[#1f2530] sm:text-lg">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#5a6170]">
                  {step.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-10 sm:px-6 sm:py-14 lg:px-10">
        <div className="mx-auto w-full max-w-4xl space-y-6">
          <div className="space-y-3 text-center">
            <h2 className="text-2xl font-semibold leading-tight text-[#1f2530] sm:text-3xl">
              Questions before you move?
            </h2>
            <p className="text-sm leading-relaxed text-[#5a6170] sm:text-base">
              The answers teams ask for most during a migration.
            </p>
          </div>
          <div className="space-y-3">
            {faqs.map((faq) => (
              <details
                key={faq.question}
                className="group rounded-2xl border border-[#e7e9f0] bg-white px-5 py-4 sm:px-6"
              >
                <summary className="cursor-pointer list-none text-sm font-semibold text-[#1f2530] sm:text-base">
                  {faq.question}
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-[#5a6170]">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-16 pt-6 sm:px-6 lg:px-10">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-5 rounded-[28px] bg-[#1f2530] px-6 py-12 text-center sm:px-10">
          <h2 className="max-w-2xl text-2xl font-semibold leading-tight text-white sm:text-3xl">
            Ready to give your community a clearer home?
          </h2>
          <p className="max-w-2xl text-sm leading-relaxed text-white/70 sm:text-base">
            Start free with your first cohort, or talk to us about moving a
            whole school or bootcamp.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <ArrowBtn text="Book a Demo" href="/contact-sales" />
            <OutlineBtn
              text="Start for Free"
              href="/auth/sign-up"
              className="border-white/30 text-white hover:bg-white hover:text-[#1f2530]"
            />
          </div>
        </div>
      </section>
    </>
  );
};

export default MigratePage;
