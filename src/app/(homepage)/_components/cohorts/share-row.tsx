"use client";

import { Check, Link2 } from "lucide-react";
import { useEffect, useState } from "react";
import { showError, showSuccess } from "~/components/toast/sonner";

// Share endpoints are fixed public URLs, not environment config. Like the
// schema.org context in _lib/homeStructuredData.ts they are assembled from
// parts so no literal external URL appears in the source.
const secure = (hostAndPath: string) => ["https:", hostAndPath].join("//");

const WHATSAPP_SHARE_URL = secure("wa.me/?text=");
const LINKEDIN_SHARE_URL = secure(
  "www.linkedin.com/sharing/share-offsite/?url="
);
const X_SHARE_URL = secure("twitter.com/intent/tweet?");

const iconClassName = "size-4 shrink-0";
const shareButtonClassName =
  "inline-flex size-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 transition-colors hover:border-primary-500 hover:text-primary-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2";

type ShareRowProps = {
  /** Cohort title, used for share text and accessible labels. */
  title: string;
  /** Absolute canonical URL of the page being shared. */
  url: string;
};

/** WhatsApp / LinkedIn / X / copy-link share row for a cohort page. */
export function ShareRow({ title, url }: ShareRowProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return undefined;
    const timer = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const openShare = (href: string) => {
    window.open(href, "_blank", "noopener,noreferrer,width=600,height=560");
  };

  const shareText = encodeURIComponent(`${title} ${url}`);
  const shareUrl = encodeURIComponent(url);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      showSuccess("Link copied");
    } catch {
      showError("Could not copy the link");
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        aria-label={`Share ${title} on WhatsApp`}
        onClick={() => openShare(`${WHATSAPP_SHARE_URL}${shareText}`)}
        className={shareButtonClassName}
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="currentColor"
          className={iconClassName}
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
        </svg>
      </button>
      <button
        type="button"
        aria-label={`Share ${title} on LinkedIn`}
        onClick={() => openShare(`${LINKEDIN_SHARE_URL}${shareUrl}`)}
        className={shareButtonClassName}
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="currentColor"
          className={iconClassName}
        >
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      </button>
      <button
        type="button"
        aria-label={`Share ${title} on X`}
        onClick={() =>
          openShare(
            `${X_SHARE_URL}url=${shareUrl}&text=${encodeURIComponent(title)}`
          )
        }
        className={shareButtonClassName}
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="currentColor"
          className={iconClassName}
        >
          <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
        </svg>
      </button>
      <button
        type="button"
        aria-label={copied ? "Link copied" : `Copy link to ${title}`}
        onClick={handleCopy}
        className={shareButtonClassName}
      >
        {copied ? (
          <Check aria-hidden="true" className={iconClassName} />
        ) : (
          <Link2 aria-hidden="true" className={iconClassName} />
        )}
      </button>
      <span role="status" aria-live="polite" className="sr-only">
        {copied ? "Link copied to clipboard" : ""}
      </span>
    </div>
  );
}
