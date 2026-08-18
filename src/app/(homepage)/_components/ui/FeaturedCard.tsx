import Image from "next/image";
import { cn } from "~/lib/utils";

export type FeaturedCardProps = {
  title: string;
  desc: string;
  image: string;
  className?: string;
};

export const FeaturedCard = ({
  title,
  desc,
  image,
  className = "",
}: FeaturedCardProps) => {
  return (
    <article
      className={cn(
        "flex h-full flex-col gap-12 overflow-hidden bg-[#F9F7FD] rounded-2xl px-6 py-8",
        className
      )}
    >
      <div className="space-y-4 text-center">
        <h3 className="text-lg font-semibold text-[#1f2530] sm:text-xl">
          {title}
        </h3>
        <p className="mx-auto max-w-[34ch] text-sm leading-relaxed text-neutral-600 sm:text-base">
          {desc}
        </p>
      </div>

      <div className="relative overflow-hidden rounded-xl -mb-8">
        <div className="relative aspect-[4/3] w-full">
          <Image
            src={image}
            alt={`${title} interface preview`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 48vw, 32vw"
            className="object-cover object-top"
          />
        </div>
      </div>
    </article>
  );
};
