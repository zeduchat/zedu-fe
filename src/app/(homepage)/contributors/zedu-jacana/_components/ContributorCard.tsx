import { Github } from "lucide-react";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import type { Contributor } from "../_lib/contributors";

/**
 * Generates up to two uppercase initials from a full name.
 *
 * @param name - The full name of the contributor.
 * @returns A 1-2 character uppercase initials string.
 */
function getInitials(name: string): string {
  const words = name.replace(/[^\p{L}\p{N}\s]/gu, "").split(/\s+/);
  const initials = words
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]);
  return initials.join("").toUpperCase();
}

/**
 * ContributorCard renders a single team member with avatar initials, their
 * Zedu handle and their GitHub handle.
 *
 * @param props - Contributor details.
 * @returns The rendered contributor card element.
 */
export const ContributorCard = ({
  name,
  username,
  githubUsername,
}: Contributor) => {
  return (
    <article className="flex h-full flex-col items-center gap-4 rounded-xl border border-neutral-200 bg-white p-6 text-center transition-shadow hover:shadow-md">
      <Avatar className="size-20">
        <AvatarFallback className="bg-primary-50 text-xl font-semibold text-primary-500">
          {getInitials(name)}
        </AvatarFallback>
      </Avatar>

      <div className="flex w-full flex-col gap-1">
        <h3 className="truncate text-base font-semibold text-neutral-900 sm:text-lg">
          {name}
        </h3>

        <p className="truncate text-sm text-neutral-600">@{username}</p>

        <p className="inline-flex items-center justify-center gap-1.5 text-xs text-neutral-500">
          <Github aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">@{githubUsername}</span>
        </p>
      </div>
    </article>
  );
};
