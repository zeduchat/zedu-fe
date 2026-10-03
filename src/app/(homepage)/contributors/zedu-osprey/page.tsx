import { Metadata } from "next";
import { siteUrl } from "~/lib/env-urls";
import { zeduOspreyContributors } from "~/data/zedu-osprey-contributors";
import { ContributorCard } from "../../_components/contributors/ContributorCard";

export const metadata: Metadata = {
  title: "Zedu Osprey Contributors",
  description:
    "Meet the members of the Zedu Osprey team who helped build Zedu.",
  icons: {
    icon: "/TelexIcon.svg",
  },
  alternates: {
    canonical: siteUrl("/contributors/zedu-osprey"),
  },
};

const ZeduOspreyContributorsPage = () => {
  return (
    <div className="space-y-12 pb-20">
      <section className="relative isolate mt-10 flex w-full flex-col items-center gap-4 overflow-hidden px-4 pt-10 text-center sm:gap-6 sm:px-8 sm:pt-16 lg:px-12">
        <h1 className="text-2xl font-semibold leading-tight text-neutral-900 sm:text-4xl md:text-5xl">
          Meet <span className="text-primary-500">Zedu Osprey</span>
        </h1>
        <p className="max-w-[95%] text-xs text-neutral-600 sm:max-w-[90%] sm:text-base md:max-w-[65%] lg:max-w-[45%] lg:text-lg">
          The {zeduOspreyContributors.length} contributors who helped build
          Zedu.
        </p>
      </section>

      <section className="w-full px-4 sm:px-8 lg:px-12">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {zeduOspreyContributors.map((contributor) => (
            <ContributorCard key={contributor.username} {...contributor} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default ZeduOspreyContributorsPage;
