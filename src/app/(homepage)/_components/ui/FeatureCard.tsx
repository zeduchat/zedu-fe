import Image from "next/image";
import { cn } from "~/lib/utils";

type FeatureCardProps = {
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  className?: string;
};

export const FeatureCard = ({
  title,
  description,
  imageSrc,
  imageAlt,
  className,
}: FeatureCardProps) => {
  return (
    <div
      className={cn(
        "flex h-full min-h-[22rem] max-w-[300px] flex-col rounded-2xl bg-[#f6f4fc] p-4 sm:p-5",
        className
      )}
    >
      <div className="mb-5 w-full rounded-xl bg-white/70 p-3 sm:p-4">
        <div className="relative mx-auto aspect-[4/3] w-full max-w-[280px]">
          <Image
            src={imageSrc}
            preload
            alt={imageAlt}
            fill
            sizes="(max-width: 640px) 70vw, (max-width: 1024px) 40vw, 280px"
            className="object-contain object-center"
          />
        </div>
      </div>
      <div className="flex flex-1 flex-col justify-start gap-2 text-left">
        <h2 className="text-xl font-semibold text-neutral-900">{title}</h2>
        <p className="text-sm leading-relaxed text-neutral-600">
          {description}
        </p>
      </div>
    </div>
  );
};
