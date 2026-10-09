import type { Contributor } from "../_lib/contributors";
import { TeamRow } from "./team-row";

export function TeamList({ contributors }: { contributors: Contributor[] }) {
  if (contributors.length === 0) {
    return (
      <p className="rounded-xl border border-neutral-200 bg-white px-6 py-10 text-center text-sm text-neutral-600">
        No contributors yet.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-neutral-100 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
      {contributors.map((contributor) => (
        <TeamRow key={contributor.name} contributor={contributor} />
      ))}
    </ul>
  );
}
