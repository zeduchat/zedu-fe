import type { Metadata } from "next";
import React from "react";
import { ogImageUrl, siteUrl } from "~/lib/env-urls";
import { Toaster } from "~/components/ui/toaster";

export const metadata: Metadata = {
  metadataBase: process.env.NEXT_PUBLIC_CLIENT_URL
    ? new URL(siteUrl())
    : undefined,
  title: "You're invited to join Zedu",
  description:
    "Join your team on Zedu, the learning platform for bootcamps, schools and cohorts. Accept your invite to get started.",
  icons: {
    icon: "/TelexIcon.svg",
  },
  openGraph: {
    title: "You're invited to join Zedu",
    description:
      "Join your team on Zedu, the learning platform for bootcamps, schools and cohorts. Accept your invite to get started.",
    url: "/accept_org_invitation",
    siteName: "Zedu",
    images: [
      {
        url: ogImageUrl("og-image-5.png"),
        width: 1200,
        height: 630,
        alt: "You're invited to join Zedu — the learning platform for bootcamps, schools and cohorts",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "You're invited to join Zedu",
    description:
      "Join your team on Zedu, the learning platform for bootcamps, schools and cohorts. Accept your invite to get started.",
    images: [ogImageUrl("og-image-5.png")],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      {/* <Header /> */}
      <div className="">{children}</div>
      {/* <ExternalPageFooter /> */}
      <Toaster />
    </>
  );
}
