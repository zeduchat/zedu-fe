import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import type { Contributor } from "../_lib/contributors";

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function TeamRow({ contributor }: { contributor: Contributor }) {
  const { name, email, role, avatar } = contributor;

  return (
    <li className="flex items-center gap-4 px-4 py-4 sm:px-6">
      <Avatar className="h-11 w-11 rounded-lg">
        {avatar && <AvatarImage src={avatar} alt={name} />}
        <AvatarFallback className="rounded-lg bg-primary-100 text-sm font-semibold text-primary-500">
          {initials(name)}
        </AvatarFallback>
      </Avatar>

      <div className="flex min-w-0 flex-1 flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <p className="break-words font-semibold text-neutral-900">{name}</p>
          {email && (
            <p className="truncate text-sm text-neutral-600">{email}</p>
          )}
        </div>

        <Badge className="w-fit shrink-0 border-transparent bg-neutral-100 font-medium text-neutral-700 hover:bg-neutral-100">
          {role}
        </Badge>
      </div>
    </li>
  );
}
