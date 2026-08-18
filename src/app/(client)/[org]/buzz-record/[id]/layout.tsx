import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Zedu - Buzz Recording",
  robots: {
    index: false,
    follow: false,
  },
};

export default function BuzzRecordMeetingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <section>{children}</section>;
}
