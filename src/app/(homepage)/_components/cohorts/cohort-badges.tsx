import { Badge } from "~/components/ui/badge";
import { cn } from "~/lib/utils";
import type { Cohort } from "../../_lib/cohorts";

const STATUS_LABELS: Record<Cohort["status"], string> = {
  active: "Active",
  upcoming: "Upcoming",
};

const STATUS_CLASSES: Record<Cohort["status"], string> = {
  active:
    "border-transparent bg-emerald-100 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  upcoming:
    "border-transparent bg-blue-100 text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300",
};

/** Status pill derived from a cohort entry's `status`. */
export function CohortStatusBadge({ status }: { status: Cohort["status"] }) {
  return (
    <Badge variant="outline" className={STATUS_CLASSES[status]}>
      {STATUS_LABELS[status]}
    </Badge>
  );
}

/**
 * "Example — not a live programme" pill. Derived from `kind`, so any entry
 * with kind "example" renders it wherever an entry is shown; real entries
 * render nothing.
 */
export function CohortExampleBadge({ kind }: { kind: Cohort["kind"] }) {
  if (kind !== "example") return null;
  return (
    <Badge
      variant="secondary"
      className={cn(
        "whitespace-normal border-amber-200 bg-amber-100 text-[11px] font-medium text-amber-900",
        "dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300"
      )}
    >
      Example — not a live programme
    </Badge>
  );
}
