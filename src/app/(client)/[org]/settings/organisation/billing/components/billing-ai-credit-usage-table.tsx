import React from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  ColumnDef,
  flexRender,
  SortingState,
  ColumnFiltersState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import EmptyState from "./billing-ai-credit-empty-usage-table";
import { Button } from "~/components/ui/button";
import Icons from "~/app/(client)/[org]/_components/billing/icons";
import { cn } from "~/lib/utils";
import { AIUsageRecord, CreditUsageRecord } from "../type";
import { mockData } from "../data";
import Image from "next/image";
import images from "~/assets/images";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { X } from "lucide-react";
import { PopoverClose } from "@radix-ui/react-popover";

interface AICreditsUsageProps {
  creditUsageData?: CreditUsageRecord[];
  isLoading?: boolean;
}

export default function AICreditsUsage({
  creditUsageData = [],
  isLoading = false,
}: AICreditsUsageProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  // eslint-disable-next-line
  const [showEmptyState, setShowEmptyState] = React.useState(false);

  // Transform backend data to table format
  const transformCreditUsageData = React.useCallback(
    (data: CreditUsageRecord[]): AIUsageRecord[] => {
      return data.map((record) => ({
        id: record.id,
        agentName: record.agent_name || "", // Empty string for general usage
        agentType: "analytics" as const, // Default type since backend doesn't provide this
        nameOwner: `@${record.user_name}`,
        type: "Private Chat" as const, // Default type since backend doesn't provide this
        aiCredits: record.amount,
        dateTime: new Date(record.created_at)
          .toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          })
          .replace(",", " at"),
        status: "online" as const, // Default status
      }));
    },
    []
  );

  const columns: ColumnDef<AIUsageRecord>[] = [
    {
      accessorKey: "agentName",
      header: () => {
        return <p className="text-[#667085]">Agent Name</p>;
      },
      cell: ({ row }) => {
        const agentType = row.original.agentType;
        const status = row.original.status;
        const agentName = row.getValue("agentName") as string;

        return (
          <div className="flex items-center gap-3">
            <div className="relative">
              <Image
                src={agentType === "error-handler" ? images.RedBot : images.bot}
                alt={""}
                width={36}
                height={36}
                className={cn(
                  `border rounded`,
                  agentType === "error-handler"
                    ? "bg-[#FEE8E6] border-[#E6EAEF]"
                    : "bg-[#E6FAEF] border-[#E6EAEF]"
                )}
              />
              <div
                className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                  status === "online" ? "bg-green-400" : "bg-gray-400"
                }`}
              />
            </div>
            <span className="font-medium">
              {agentName || "General AI Usage"}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "nameOwner",
      header: () => {
        return <p className="text-[#667085]">Name / Owner</p>;
      },
      cell: ({ row }) => {
        const value = row.getValue("nameOwner") as string;
        const isUser = value.startsWith("@");
        return (
          <span
            className={cn(
              "border px-2 py-1 rounded-sm pb-2 ",
              isUser
                ? "text-purple-600 bg-[#F1F1FE] border-[#F1F1FE]"
                : "text-gray-900"
            )}
          >
            {value}
          </span>
        );
      },
    },
    {
      accessorKey: "type",
      header: () => {
        return <p className="text-[#667085]">Type</p>;
      },
      cell: ({ row }) => (
        <span className="text-gray-700">{row.getValue("type")}</span>
      ),
    },
    {
      accessorKey: "aiCredits",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-auto p-0 font-medium hover:bg-transparent text-[#667085]"
          >
            AI Credits
            <Icons name="move-down" svgProps={{}} />
          </Button>
        );
      },
      cell: ({ row }) => (
        <span className="font-medium">{row.getValue("aiCredits")}</span>
      ),
    },
    {
      accessorKey: "dateTime",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-auto p-0 font-medium hover:bg-transparent text-[#667085]"
          >
            Date/Time
            <Icons name="move-down" svgProps={{}} />
          </Button>
        );
      },
      cell: ({ row }) => (
        <span className="text-gray-700">{row.getValue("dateTime")}</span>
      ),
    },
  ];

  const tableData = React.useMemo(() => {
    if (showEmptyState) return [];

    // Use real data if available, otherwise show empty state
    if (creditUsageData && creditUsageData.length > 0) {
      return transformCreditUsageData(creditUsageData);
    }

    // If creditUsageData is null or empty array, show empty state
    if (creditUsageData !== undefined) {
      return [];
    }

    // Fallback to mock data for development/testing
    return mockData;
  }, [showEmptyState, creditUsageData, transformCreditUsageData]);

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: {
      sorting,
      columnFilters,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
    // Reset pagination when data changes
    autoResetPageIndex: false,
  });

  // Reset pagination when data changes to prevent crashes
  React.useEffect(() => {
    try {
      if (table && table.setPageIndex) {
        table.setPageIndex(0);
      }
    } catch (error) {
      console.error("Error resetting page index:", error);
    }
  }, [showEmptyState, table]);

  const currentPage = table.getState().pagination.pageIndex + 1;
  const totalPages = table.getPageCount();
  const hasData = !showEmptyState && tableData.length > 0;

  // Show loading state
  if (isLoading) {
    return (
      <div className="w-full mx-auto bg-white border mt-6 rounded-xl">
        <div className="flex h-[80px] items-center px-6 justify-between border-b">
          <div className="flex items-center gap-1">
            <h1 className="text-xl font-semibold text-gray-900">
              AI Credits Usage
            </h1>
          </div>
        </div>
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-500">
            Loading credit transactions...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto  bg-white border  mt-6 rounded-xl">
      <div
        className={cn(
          `flex h-[80px] items-center px-6 justify-between`,
          !hasData && "border-b"
        )}
      >
        <div className="flex items-center gap-1">
          <h1 className="text-xl font-semibold text-gray-900">
            AI Credits Usage
          </h1>
        </div>
        {hasData && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {columnFilters.map((filter) => (
                <div
                  key={filter.id}
                  className="flex items-center gap-1 bg-[#F6F7F9] px-2 py-1 rounded-md border gap-2 py-2 text-[#344054]"
                >
                  <span className="text-sm">
                    {filter.id === "type"
                      ? `${filter.value}`
                      : `${filter.id}: ${filter.value}`}
                  </span>
                  <Button
                    onClick={() => {
                      setColumnFilters((prev) =>
                        prev.filter((f) => f.id !== filter.id)
                      );
                    }}
                    className="text-gray-500 hover:text-gray-700 p-0 h-fit"
                    variant="ghost"
                  >
                    <X size={18} />
                  </Button>
                </div>
              ))}

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 border-[#D0D5DD] rounded-lg text-[#344054]"
                  >
                    <Icons name="filter" svgProps={{}} />
                    Filter
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-0" align="end">
                  <div className="flex flex-col space-y-1">
                    {["All", "Channel", "Public Chat", "Private Group"].map(
                      (option) => (
                        <PopoverClose className="w-full" key={option}>
                          <Button
                            className="px-4 py-1 text-left hover:bg-gray-100 rounded-md text-sm rounded-none w-full"
                            onClick={() => {
                              if (option === "All") {
                                setColumnFilters([]);
                              } else {
                                setColumnFilters([
                                  { id: "type", value: option },
                                ]);
                              }
                            }}
                          >
                            <p className="w-full">{option}</p>
                          </Button>
                        </PopoverClose>
                      )
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            <Button
              variant="outline"
              className="flex items-center gap-2 border-[#D0D5DD] rounded-lg text-[#344054]"
            >
              <Icons name="export" svgProps={{}} />
              Export
            </Button>
          </div>
        )}
      </div>

      {hasData ? (
        <>
          <div className="border-b overflow-x-auto">
            <Table className="min-w-[800px]">
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} className="bg-gray-50">
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        className="font-medium text-gray-700 whitespace-nowrap"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                      className="hover:bg-gray-50"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          className="py-4 whitespace-nowrap"
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-6 space-x-2 py-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="flex items-center gap-2 border-gray-300"
            >
              <Icons name="move-left" svgProps={{}} />
              Previous
            </Button>

            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 7) {
                  pageNum = i + 1;
                } else if (currentPage <= 4) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 3) {
                  pageNum = totalPages - 6 + i;
                } else {
                  pageNum = currentPage - 3 + i;
                }

                if (pageNum === 4 && currentPage > 4 && totalPages > 7) {
                  return (
                    <span key="ellipsis1" className="px-2">
                      ...
                    </span>
                  );
                }
                if (
                  pageNum === totalPages - 3 &&
                  currentPage < totalPages - 3 &&
                  totalPages > 7
                ) {
                  return (
                    <span key="ellipsis2" className="px-2">
                      ...
                    </span>
                  );
                }

                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => table.setPageIndex(pageNum - 1)}
                    className="w-8 h-8 p-0"
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="flex items-center gap-2 border-gray-300"
            >
              Next
              <Icons name="move-right" svgProps={{}} />
            </Button>
          </div>
        </>
      ) : (
        <EmptyState />
      )}
    </div>
  );
}
