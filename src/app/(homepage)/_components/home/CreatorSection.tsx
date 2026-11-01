import { Clapperboard, Handshake, MessagesSquare } from "lucide-react";
import { ArrowBtn } from "../ui/Button";
import {
  creatorFeatures,
  creatorJourney,
  creatorSectionCopy,
} from "../../_lib/creatorSectionData";

const creatorFeatureIcons = [Clapperboard, MessagesSquare, Handshake];

export const CreatorSection = () => {
  return (
    <section
      aria-labelledby="creator-section-heading"
      className="relative isolate flex w-full flex-col items-center gap-8 overflow-hidden bg-primary-50 px-4 py-12 text-center sm:gap-10 sm:px-8 sm:py-16 lg:gap-12 lg:px-12 lg:py-20"
    >
      <div className="flex flex-col items-center gap-3">
        <h2
          id="creator-section-heading"
          className="max-w-4xl text-2xl font-semibold leading-tight text-neutral-900 sm:text-3xl md:text-4xl"
        >
          Train the Next Wave of{" "}
          <span className="text-primary-500">YouTube Creators</span> on Zedu
        </h2>
        <p className="max-w-[95%] text-sm text-neutral-600 sm:max-w-[90%] sm:text-base md:max-w-[85%] lg:max-w-[65%] lg:text-lg">
          {creatorSectionCopy.description}
        </p>
      </div>

      <div className="grid w-full max-w-7xl grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
        {creatorFeatures.map((feature, index) => {
          const Icon = creatorFeatureIcons[index];
          return (
            <article
              key={feature.title}
              className="flex flex-col items-start rounded-2xl border border-primary-100 bg-white px-6 pb-8 pt-7 text-left sm:px-8 sm:pb-10 sm:pt-9 sm:last:col-span-2 lg:last:col-span-1"
            >
              <span
                aria-hidden="true"
                className="mb-5 flex size-12 items-center justify-center rounded-xl bg-primary-500 text-white sm:mb-7 sm:size-[52px]"
              >
                <Icon className="size-6" strokeWidth={2} />
              </span>
              <h3 className="mb-3 text-xl font-bold leading-snug text-blue-500">
                {feature.title}
              </h3>
              <p className="leading-relaxed text-neutral-600">{feature.desc}</p>
            </article>
          );
        })}
      </div>

      <div className="flex w-full max-w-7xl flex-col items-center gap-6 rounded-2xl border border-primary-100 bg-white px-4 py-8 sm:px-8 sm:py-10">
        <h3 className="text-lg font-semibold text-neutral-900 sm:text-xl">
          {creatorSectionCopy.journeyHeading}
        </h3>
        <ol className="grid w-full grid-cols-1 gap-4 text-left sm:grid-cols-2 lg:grid-cols-4 lg:gap-0">
          {creatorJourney.map((step, index) => (
            <li
              key={step.title}
              className="relative flex items-start gap-3 lg:flex-col lg:items-center lg:px-4 lg:text-center"
            >
              {index < creatorJourney.length - 1 && (
                <span
                  aria-hidden="true"
                  className="absolute left-[calc(50%+1.5rem)] right-[calc(-50%+1.5rem)] top-5 hidden h-0.5 bg-primary-100 lg:block"
                />
              )}
              <span
                aria-hidden="true"
                className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-500 text-sm font-semibold text-white"
              >
                {index + 1}
              </span>
              <div className="flex flex-col gap-1">
                <span className="font-semibold text-neutral-900">
                  {step.title}
                </span>
                <span className="text-sm text-neutral-600">{step.desc}</span>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <ArrowBtn text={creatorSectionCopy.ctaText} linkToHome />
    </section>
  );
};
