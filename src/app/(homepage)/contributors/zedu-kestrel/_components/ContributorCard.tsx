import { Mail } from "lucide-react";
import type { Contributor } from "../_lib/contributors";

/**
 * Generates up to two uppercase initials from a full name.
 *
 * @param fullName - The full name of the contributor.
 * @returns A 1-2 character uppercase initials string.
 */
function getInitials(fullName: string): string {
  return fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

/**
 * ContributorCard component renders an individual team member card with
 * avatar initials, role, background, Zedu handle, and contact links.
 *
 * @param member - Contributor details.
 * @returns The rendered contributor card element.
 */
export const ContributorCard = (member: Contributor) => {
  return (
    <article className="flex h-full flex-col justify-between rounded-xl border border-neutral-200 bg-white p-5 text-left transition hover:border-primary-300 hover:shadow-sm">
      <div className="flex items-start gap-3.5">
        <div
          aria-hidden="true"
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${member.avatarGradient} text-base font-bold text-white shadow-sm`}
        >
          {getInitials(member.name)}
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="truncate text-base font-semibold text-neutral-900">
            {member.name}
          </h2>
          <p className="text-xs font-medium text-primary-500">
            AI Product Engineer
          </p>
          <p className="mt-1 text-xs text-neutral-600">
            Background:{" "}
            <span className="font-medium text-neutral-800">
              {member.background}
            </span>
          </p>
          <p className="mt-0.5 text-xs text-neutral-500">
            Zedu: <span className="font-medium">@{member.zeduName}</span>
          </p>
        </div>
      </div>

      <div className="mt-5 flex items-center border-t border-neutral-100 pt-3.5 text-xs text-neutral-600">
        <a
          href={`mailto:${member.email}`}
          className="inline-flex items-center gap-1.5 truncate text-neutral-600 transition hover:text-primary-500"
        >
          <Mail className="h-3.5 w-3.5 shrink-0 text-primary-500" />
          <span className="truncate">{member.email}</span>
        </a>
      </div>
    </article>
  );
};
