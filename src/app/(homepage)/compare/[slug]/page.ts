import type { Metadata } from "next";
import { createElement } from "react";
import { notFound } from "next/navigation";
import { ogImageUrl, siteUrl } from "~/lib/env-urls";
import { ComparePage } from "../../_components/compare/ComparePage";
import { comparisons } from "../../_lib/compare";

type ComparePageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(comparisons).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: ComparePageProps): Promise<Metadata> {
  const { slug } = await params;
  const content = comparisons[slug];
  if (!content) return {};

  const { meta } = content;
  const url = siteUrl(`/compare/${slug}`);

  return {
    title: meta.title,
    description: meta.description,
    keywords: meta.keywords,
    openGraph: {
      title: meta.ogTitle,
      description: meta.description,
      url,
      siteName: "Zedu",
      images: [
        {
          url: ogImageUrl("og-image-5.png"),
          width: 1200,
          height: 630,
          alt: meta.ogTitle,
        },
      ],
      type: "website",
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: meta.ogTitle,
      description: meta.description,
      images: [ogImageUrl("og-image-5.png")],
    },
    alternates: {
      canonical: url,
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
}

const CompareRoute = async ({ params }: ComparePageProps) => {
  const { slug } = await params;
  const content = comparisons[slug];
  if (!content) notFound();

  return createElement(ComparePage, { content });
};

export default CompareRoute;
