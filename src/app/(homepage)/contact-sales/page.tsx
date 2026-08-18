import { Metadata } from "next";
import { ContactSalesBenefits } from "./_components/ContactSalesBenefits";
import { ContactSalesForm } from "./_components/ContactSalesForm";

export const metadata: Metadata = {
  title: "Contact Sales",
  description:
    "Contact the Zedu sales team to find the right plan for your school, bootcamp, or learning organization. Get tailored pricing, onboarding guidance, and enterprise support.",
  keywords: [
    "contact Zedu sales",
    "education platform demo",
    "bootcamp software sales",
    "enterprise learning platform",
    "cohort management software",
    "school communication platform",
    "AI education platform pricing",
    "Zedu onboarding",
  ],
  icons: {
    icon: "/TelexIcon.svg",
  },
  openGraph: {
    title: "Contact Sales - Zedu for Schools and Cohorts",
    description:
      "Talk to Zedu sales about tailored plans, onboarding, and AI-powered collaboration for modern learning teams.",
    url: "https://zedu.chat/contact-sales",
    siteName: "Zedu",
    images: [
      {
        url: "https://media.zedu.chat/telexprodbucket/public/og-images/og-image-5.png",
        width: 1200,
        height: 630,
        alt: "Contact Zedu sales for education platform plans",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Sales - Zedu",
    description:
      "Get tailored plans and onboarding from Zedu sales for your school, bootcamp, or cohort-based learning organization.",
    images: [
      "https://media.zedu.chat/telexprodbucket/public/og-images/og-image-5.png",
    ],
  },
  alternates: {
    canonical: "https://zedu.chat/contact-sales",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const ContactPage = () => {
  return (
    <section className="relative mt-12 flex px-4 py-16">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[50%] bg-gradient-to-t from-blue-50/30 to-white"
      />

      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-8 lg:grid-cols-[0.95fr_1.15fr] lg:items-center lg:gap-10">
        <ContactSalesBenefits />
        <ContactSalesForm />
      </div>
    </section>
  );
};

export default ContactPage;
