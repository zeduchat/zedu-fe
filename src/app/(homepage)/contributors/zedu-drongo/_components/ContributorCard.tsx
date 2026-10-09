import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import type { Contributor } from "../_lib/contributors";

/**
 * Extracts and formats up to the first two initials from a given name.
 * Strips special characters, splits by whitespace, and converts to uppercase.
 *
 * @param {string} name - The full name to extract initials from.
 * @returns {string} The formatted initials (maximum of 2 characters).
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
 * Renders a card displaying a contributor's profile, including an
 * avatar with their initials, full name, and username handle.
 *
 * @component
 * @param {Contributor} props - The contributor data properties.
 * @param {string} props.name - The full name of the contributor.
 * @param {string} props.username - The GitHub username of the contributor.
 * @returns {JSX.Element} An article card representing the contributor.
 */
export const ContributorCard = ({ name, username }: Contributor) => {
  return (
    <article className="flex h-full flex-col items-center gap-4 rounded-xl border border-neutral-200 bg-white p-6 text-center transition-shadow hover:shadow-md">
      <Avatar className="size-20">
        <AvatarFallback className="bg-primary-50 text-xl font-semibold text-primary-500">
          {getInitials(name)}
        </AvatarFallback>
      </Avatar>
      <div className="flex w-full flex-col gap-1">
        <h3 className="text-base font-semibold text-neutral-900 sm:text-lg">
          {name}
        </h3>
        <p className="text-sm text-neutral-600">@{username}</p>
      </div>
    </article>
  );
};
