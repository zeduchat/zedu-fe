import { Metadata } from "next";
import { ogImageUrl, siteUrl } from "~/lib/env-urls";
import { larkContributors } from "./_lib/contributors";
import { ContributorsDirectory } from "./_components/contributors-directory";

export const metadata: Metadata = {
  title: "Contributors",
  description: "Meet the LARK team contributing to Zedu.",
  openGraph: {
    title: "Contributors | Zedu",
    description: "Meet the LARK team contributing to Zedu.",
    url: siteUrl("/contributors/lark"),
    siteName: "Zedu",
    images: [
      {
        url: ogImageUrl("og-image-5.png"),
        width: 1200,
        height: 630,
        alt: "The contributors behind Zedu",
      },
    ],
    type: "website",
  },
  alternates: {
    canonical: siteUrl("/contributors/lark"),
  },
};

export default function LarkContributorsPage() {
  return (
    <section className="w-full px-4 py-10 sm:px-8 sm:py-16 lg:px-12 mt-10">
      <div className="mx-auto w-full max-w-4xl">
        <ContributorsDirectory contributors={larkContributors} />
      </div>
    </section>
  );
}
