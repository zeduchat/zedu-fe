import { Button } from "~/components/ui/button";
import Icons from "~/app/(client)/[org]/_components/billing/icons";

type PageItem = number | "ellipsis";

function getPageItems(current: number, total: number): PageItem[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }

  const items: PageItem[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  if (start > 2) items.push("ellipsis");
  for (let page = start; page <= end; page += 1) items.push(page);
  if (end < total - 1) items.push("ellipsis");
  items.push(total);

  return items;
}

const TablePagination = ({
  currentPage,
  totalPages,
  onPageChange,
  canPrevious,
  canNext,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  canPrevious: boolean;
  canNext: boolean;
}) => {
  if (totalPages <= 1) return null;

  const pages = getPageItems(currentPage, totalPages);

  return (
    <div className="flex items-center justify-between gap-3 px-6 py-4 border-t">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!canPrevious}
        className="gap-2 shrink-0"
      >
        <Icons name="move-left" svgProps={{}} /> Previous
      </Button>

      <div className="flex items-center justify-center gap-1 min-w-0 flex-wrap">
        {pages.map((page, index) =>
          page === "ellipsis" ? (
            <span
              key={`ellipsis-${index}`}
              className="px-1 text-sm text-[#667085]"
            >
              …
            </span>
          ) : (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              size="sm"
              onClick={() => onPageChange(page)}
              className="min-w-8 h-8 px-2"
            >
              {page}
            </Button>
          )
        )}
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!canNext}
        className="gap-2 shrink-0"
      >
        Next <Icons name="move-right" svgProps={{}} />
      </Button>
    </div>
  );
};

export default TablePagination;
