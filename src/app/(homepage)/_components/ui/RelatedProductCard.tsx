import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "~/lib/utils";

export type RelatedProductCardProps = {
  title: string;
  description: string;
  icon: string;
  /** The product page this card leads to. Cards without one stay static. */
  href?: string;
};

const cardClassName =
  "flex h-full flex-col justify-center gap-3 rounded-2xl bg-white p-4 sm:gap-4 sm:rounded-3xl sm:p-6";

export const RelatedProductCard = ({
  title,
  description,
  icon,
  href,
}: RelatedProductCardProps) => {
  const content = (
    <>
      <Image
        src={icon}
        alt=""
        height={40}
        width={40}
        className="h-8 w-8 sm:h-10 sm:w-10"
      />
      <h3
        className={cn(
          "text-base font-semibold text-neutral-900 sm:text-lg",
          href && "transition group-hover:text-primary-500"
        )}
      >
        {title}
      </h3>
      <p className="text-xs leading-relaxed text-neutral-600 sm:text-sm">
        {description}
      </p>
    </>
  );

  if (!href) {
    return <div className={cardClassName}>{content}</div>;
  }

  return (
    <Link
      href={href}
      className={cn(
        cardClassName,
        "group transition hover:shadow-md hover:ring-1 hover:ring-primary-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
      )}
    >
      {content}
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary-500 sm:text-sm">
        Learn more
        <ArrowRight
          aria-hidden="true"
          className="h-3.5 w-3.5 transition group-hover:translate-x-1"
        />
      </span>
    </Link>
  );
};
