import { Metadata } from "next";
import { ogImageUrl, siteUrl } from "~/lib/env-urls";

export const metadata: Metadata = {
  title: "Zedu - Seamless Video Meetings & Learning Communities",
  description:
    "Connect classrooms, cohorts, and teams in one shared space. Zedu provides high-quality video calls and collaborative tools designed for every learning community.",
  keywords: [
    "Zedu video meetings",
    "online learning platform",
    "video conferencing for education",
    "virtual classrooms",
    "Zedu chat",
    "seamless video calls",
    "team collaboration tool",
    "cohort communication",
    "learning community platform",
    "interactive video meetings",
  ],
  openGraph: {
    title: "Zedu - Seamless Video Meetings & Learning Communities",
    description:
      "Join the conversation on Zedu. Connect with your team or classroom through our high-performance video meeting platform.",
    url: siteUrl(),
    siteName: "Zedu",
    images: [
      {
        url: ogImageUrl("og-image-4.png"),
        width: 1200,
        height: 630,
        alt: "Zedu - Collaborative Video Meetings for Teams and Classrooms",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Zedu - Seamless Video Meetings & Learning Communities",
    description:
      "Seamless video calls and meetings for every learning community. Connect in one shared space with Zedu.",
    images: [ogImageUrl("og-image-4.png")],
  },
  alternates: {
    canonical: siteUrl(),
  },
};

export default function MeetingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <section>{children}</section>;
}

// import { Metadata } from "next";

// type Props = {
//   params: { slug: string; id: string };
// };

// export async function generateMetadata({ params }: Props): Promise<Metadata> {
//   const buzzId = params.id;
//   let displayTitle = "Zedu - Seamless Video Meetings";

//   try {
//     const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/buzz/${buzzId}`);
//     const resData = await response.json();

//     const creator = resData?.data?.creator_username || resData?.data?.username;

//     if (creator) {
//       displayTitle = `${creator} is inviting you to a meeting on Zedu`;
//     }
//   } catch (error) {}

//   return {
//     title: displayTitle,
//     description: "Connect classrooms, cohorts, and teams in one shared space. Zedu provides high-quality video calls for every learning community.",
//     keywords: [
//       "Zedu video meetings",
//       "online learning platform",
//       "virtual classrooms",
//       "Zedu chat",
//       "learning community platform"
//     ],
//     openGraph: {
//       title: displayTitle,
//       description: "Join the conversation on Zedu. Connect with your team or classroom through our high-performance video meeting platform.",
//       url: siteUrl(`/buzz/${buzzId}`),
//       siteName: "Zedu",
//       images: [
//         {
//           url: ogImageUrl("og-image-4.png"),
//           width: 1200,
//           height: 630,
//           alt: "Zedu - Collaborative Video Meetings",
//         },
//       ],
//       type: "website",
//     },
//     twitter: {
//       card: "summary_large_image",
//       title: displayTitle,
//       description: "Seamless video calls and meetings for every learning community.",
//       images: [ogImageUrl("og-image-4.png")],
//     },
//     alternates: {
//       canonical: siteUrl(`/buzz/${buzzId}`),
//     },
//   };
// }

// export default function MeetingLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return <section>{children}</section>;
// }
