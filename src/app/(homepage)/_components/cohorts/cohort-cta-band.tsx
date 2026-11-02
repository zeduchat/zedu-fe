import { ArrowBtn, OutlineBtn } from "../ui/Button";

type CohortCtaBandProps = {
  heading: string;
  description: string;
};

/** Bottom CTA band closing both public cohort routes. */
export function CohortCtaBand({ heading, description }: CohortCtaBandProps) {
  return (
    <section className="relative isolate overflow-hidden bg-[#f6f8fd] px-4 py-12 sm:px-6 sm:py-16 lg:px-10">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-5 text-center">
        <h2 className="text-3xl font-semibold leading-tight text-[#1f2530] sm:text-4xl lg:text-[44px] lg:leading-[1.12]">
          {heading}
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-gray-600 sm:text-lg">
          {description}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <ArrowBtn text="Start your own cohort" href="/auth/sign-up" />
          <OutlineBtn text="Talk to us" href="/contact-sales" />
        </div>
      </div>
    </section>
  );
}
