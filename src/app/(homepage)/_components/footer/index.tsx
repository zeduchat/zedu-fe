"use client";
import React, { useId, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Plus_Jakarta_Sans } from "next/font/google";
import axios from "axios";
import { showSuccess } from "~/components/toast/sonner";
import { usePathname } from "next/navigation";
import {
  facebookUrl,
  instagramUrl,
  pageCampaign,
  storeLink,
  tiktokUrl,
  xUrl,
} from "~/lib/env-urls";
import { Loader2, Star } from "lucide-react";
import { ZeduRoundedWhiteLogo, ZeduWhiteLogo } from "../svgs";

type FooterLink = {
  id: number;
  label: string;
  href: string;
};

const productLinks: FooterLink[] = [
  { id: 0, label: "Buzz", href: "/products/buzz" },
  { id: 1, label: "Channels", href: "/products/channels" },
  { id: 2, label: "File Management", href: "/products/file-management" },
];

const solutionLinks: FooterLink[] = [
  { id: 0, label: "Bootcamps", href: "/solutions/bootcamps" },
  { id: 1, label: "Schools", href: "/solutions/schools" },
  { id: 2, label: "Universities", href: "/solutions/universities" },
];

const supportLinks: FooterLink[] = [
  {
    id: 0,
    label: "About Us",
    href: "/about",
  },
  {
    id: 1,
    label: "Pricing",
    href: "/pricing",
  },
  {
    id: 2,
    label: "Download",
    href: "/download",
  },
  {
    id: 3,
    label: "Contact Us",
    href: "/contact-sales",
  },
];

const resourcesLinks: FooterLink[] = [
  { id: 0, label: "Resource Library", href: "/resources" },
  { id: 1, label: "Templates", href: "/templates" },
  { id: 2, label: "Privacy Policy", href: "/policy" },
  { id: 3, label: "Terms of Service", href: "/terms-of-service" },
];

const footerSections = [
  { title: "Products", links: productLinks },
  { title: "Solutions", links: solutionLinks },
  { title: "Zedu", links: supportLinks },
  { title: "Resources", links: resourcesLinks },
];

const socialLinks = [
  {
    id: 0,
    href: instagramUrl(),
    icon: "/instagram-fill.svg",
    alt: "instagram icon",
  },
  {
    id: 1,
    href: tiktokUrl(),
    icon: "/tiktok-fill.svg",
    alt: "tiktok icon",
  },
  {
    id: 2,
    href: facebookUrl(),
    icon: "/facebook-fill.svg",
    alt: "facebook icon",
  },
  {
    id: 3,
    href: xUrl(),
    icon: "/images/twitter-white.svg",
    alt: "twitter icon",
  },
];

const appStoreLinks = [
  {
    id: 0,
    store: "app" as const,
    icon: "/images/app-download/app-store-badge-2.png",
    label: "App Store",
    rating: "4.9",
    starKey: "app",
  },
  {
    id: 1,
    store: "play" as const,
    icon: "/images/app-download/google-play-badge-2.png",
    label: "Play Store",
    rating: "4.7",
    starKey: "play",
  },
];

const plusJakartaSans = Plus_Jakarta_Sans({ subsets: ["latin"] });

// Isolated Axios client for public newsletter subscription.
// Kept separate from the global HTTP client to avoid global interceptor side effects
// (such as authentication-expiry redirects or token attachment) and global toast dismissals.
const newsletterClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL,
});

const Footer = () => {
  // The footer is shared by every marketing page, so the store links name the
  // page they were clicked on.
  const storeLinkTags = {
    campaign: pageCampaign(usePathname()),
    content: "footer",
  };
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  // #1407: ties the visible label and any error message to the email field.
  const newsletterId = useId();
  const newsletterErrorId = `${newsletterId}-error`;
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (loading) return;

    setError("");

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      const res = await newsletterClient.post("/newsletter", { email });

      if (res.status === 200 || res.status === 201) {
        setEmail("");
        setError("");
        showSuccess(
          "You're subscribed!",
          "Thanks for joining us. Stay tuned for the latest updates from Zedu."
        );
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        const body = err.response?.data;
        const isAlreadySubscribed = status === 409 || body?.status_code === 409;

        if (isAlreadySubscribed) {
          setError("This email is already subscribed to our newsletter.");
        } else {
          setError(
            body?.message ||
              err.message ||
              "Something went wrong. Please try again."
          );
        }
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  //

  return (
    <footer className="flex flex-col bg-[#303073] text-[#fafafa] px-6">
      <div className="mx-auto w-full max-w-[1300px] py-8 sm:py-12">
        <div className="flex flex-col gap-12 xl:flex-row xl:items-start xl:justify-between xl:gap-16">
          <div className="w-full max-w-[420px] space-y-8">
            <div className="flex items-center gap-3">
              <Link
                href="/"
                aria-label="Zedu home"
                className="[&>svg]:h-[39px] [&>svg]:w-[39px]"
              >
                <ZeduRoundedWhiteLogo />
              </Link>
              <h3 className="text-2xl font-semibold leading-none text-white">
                Get Zedu today
              </h3>
            </div>

            <form
              onSubmit={handleSubmit}
              className="flex w-full flex-col gap-3 text-slate-100 antialiased"
            >
              <label htmlFor={newsletterId} className="font-medium text-white/95">
                Sign up to our Newsletter
              </label>
              <div>
                <div className="flex h-14 w-full items-center justify-between gap-2 rounded-xl bg-white p-1.5">
                  <input
                    id={newsletterId}
                    type="email"
                    name="newsletter"
                    required
                    autoComplete="email"
                    aria-invalid={error ? true : undefined}
                    aria-describedby={error ? newsletterErrorId : undefined}
                    placeholder="johndoe@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      // Clear a previous validation error as soon as the user
                      // edits the field again, so a stale message never lingers
                      // while they are correcting the address. React skips the
                      // state update when the value is unchanged.
                      if (error) setError("");
                    }}
                    className="h-full min-w-0 flex-1 bg-transparent border-none text-sm font-medium text-gray-900 placeholder:text-gray-400 placeholder:font-normal focus:outline-none"
                  />
                </div>
                {error && (
                  <p id={newsletterErrorId} role="alert" className="text-red-500 text-sm mt-2">
                    {error}
                  </p>
                )}
              </div>

              {error && (
                <p
                  id="newsletter-error"
                  className="text-xs font-medium text-red-300"
                  role="alert"
                >
                  {error}
                </p>
              )}
              <p className="text-[11px] font-normal text-white/70">
                Unsubscribe anytime.
              </p>
            </form>

            <div className="space-y-4">
              <p className="text-white/90">
                Mobile App is available on Google Play and the App Store
              </p>
              <div className="mt-5 flex flex-wrap items-start gap-8 text-white">
                {appStoreLinks.map((store) => (
                  <Link
                    key={store.id}
                    href={storeLink(store.store, storeLinkTags)}
                    className="space-y-1"
                  >
                    <div className="flex items-center gap-2">
                      <Image
                        src={store.icon}
                        width={24}
                        height={24}
                        alt={store.label}
                        className="h-6 w-6 rounded-md object-cover"
                      />
                      <span className="font-medium">{store.label}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {Array(5)
                        .fill(0)
                        .map((_, i) => (
                          <Star
                            key={`${store.starKey}-star-${i}`}
                            color="gold"
                            fill="gold"
                            size={12}
                          />
                        ))}
                      <span className="ml-1 text-sm text-white/85">
                        {store.rating}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="grid w-full grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4 sm:gap-x-10 xl:gap-16 xl:border-l xl:border-neutral-50/25 xl:pl-14">
            {footerSections.map((section) => (
              <div key={section.title} className="flex flex-col gap-5 sm:gap-8">
                <h2 className="text-xl font-semibold text-white">
                  {section.title}
                </h2>
                <div className="flex flex-col gap-4 text-neutral-200 sm:gap-5">
                  {section.links.map((item) => (
                    <Link
                      key={item.id}
                      href={item.href}
                      className="transition-all hover:underline"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-neutral-50/25">
        <div className="mx-auto flex w-full max-w-[1300px] flex-col items-start justify-between gap-6 py-6 sm:py-8 lg:flex-row lg:items-center">
          <div className="flex items-center gap-4 text-left">
            <div className="flex-shrink-0">
              <ZeduWhiteLogo />
            </div>
            <div className="flex flex-col gap-1 text-white/95">
              <span className="font-semibold leading-none tracking-[-0.02em]">
                © 2026 Zedu. All Rights Reserved
              </span>
              <Link
                href="mailto:contact@zedu.chat"
                className="text-[14px] leading-none font-normal text-white/85 transition-all hover:underline sm:text-[16px]"
              >
                contact@zedu.chat
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {socialLinks
              .filter((item) => Boolean(item.href))
              .map((item) => (
                <a
                  key={item.id}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={item.alt}
                  className="inline-flex transition-all hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#303073]"
                >
                  <Image
                    src={item.icon}
                    width={24}
                    height={24}
                    alt={item.alt}
                  />
                </a>
              ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
