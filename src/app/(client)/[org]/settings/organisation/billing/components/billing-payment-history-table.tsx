"use client";

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
import TableEmptyState from "../../../../_components/table-empty-state";
import { Button } from "~/components/ui/button";
import Icons from "~/app/(client)/[org]/_components/billing/icons";
import { cn } from "~/lib/utils";
import Image from "next/image";
import images from "~/assets/images";
import Loading from "~/components/ui/loading";

// Updated Interface based on your JSON response
export interface BillingTransaction {
  id: string;
  name: string;
  fee: number;
  start_date: string;
  end_date: string;
  status: string;
  session_id: string;
  organisation_created_at: string;
}

interface BillingPaymentHistoryTableProps {
  transactionData?: BillingTransaction[];
  isLoading?: boolean;
}

export default function BillingPaymentHistoryTable({
  transactionData = [],
  isLoading = false,
}: BillingPaymentHistoryTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );

  const columns: ColumnDef<BillingTransaction>[] = [
    {
      accessorKey: "name",
      header: () => <p className="text-[#667085]">Plan / Name</p>,
      cell: ({ row }) => {
        return (
          <div className="flex flex-col items-start gap-0">
            <span className="text-gray-900 font-medium">
              {row.original.name}
            </span>
            <span className="text-[#667085] text-xs uppercase tracking-wider">
              {row.original.status}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "start_date",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-medium hover:bg-transparent text-[#667085]"
        >
          Date
          <Icons name="move-down" svgProps={{}} />
        </Button>
      ),
      cell: ({ row }) => {
        const date = new Date(row.original.start_date);
        return (
          <span className="text-gray-700">
            {date.toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </span>
        );
      },
    },
    {
      accessorKey: "fee",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-medium hover:bg-transparent text-[#667085]"
        >
          Amount
          <Icons name="move-down" svgProps={{}} />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="text-gray-900 font-semibold">
            ${row.original.fee.toFixed(2)}
          </span>
          <span className="text-[#667085] text-xs">USD</span>
        </div>
      ),
    },
    {
      accessorKey: "session_id",
      header: () => <p className="text-[#667085]">Payment Method</p>,
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-3">
            <div className="border rounded bg-white border-[#F5F5F5] py-1 px-2 h-8 w-12 flex items-center justify-center">
              {/* Fallback to text or generic icon if logo doesn't exist */}
              <span className="text-[10px] font-bold text-blue-600">CARD</span>
            </div>
            <div className="flex flex-col">
              <span className="text-gray-700 text-sm truncate max-w-[120px]">
                ID: {row.original.session_id.slice(0, 8)}...
              </span>
              <span className="text-[#667085] text-xs">Stripe Checkout</span>
            </div>
          </div>
        );
      },
    },
    {
      id: "actions",
      header: () => <div className="text-[#667085]">Invoice</div>,
      cell: ({ row }) => (
        <Button
          // onClick={() => window.open(`/billing/invoice/${row.original.id}`, "_blank")}
          variant="outline"
          className="text-gray-700 h-9 w-9 p-0"
          title="Download Invoice"
        >
          <Image src={images.fileDoc} alt="Invoice" width={20} height={20} />
        </Button>
      ),
    },
  ];

  const table = useReactTable({
    data: transactionData,
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
    autoResetPageIndex: false,
  });

  if (isLoading) {
    return (
      <div className="w-full mx-auto bg-white border mt-6 rounded-xl overflow-hidden">
        <div className="flex items-center justify-center py-24">
          <Loading color="blue" />
          <span className="ml-3 text-gray-500 font-medium">
            Loading history...
          </span>
        </div>
      </div>
    );
  }

  const hasData = transactionData.length > 0;

  return (
    <div className="w-full mx-auto bg-white border mt-6 rounded-xl overflow-hidden shadow-sm">
      {hasData ? (
        <>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} className="bg-gray-50/50">
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id} className="h-12">
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
                {table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-4">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50/30">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="gap-2"
            >
              <Icons name="move-left" svgProps={{}} />
              Previous
            </Button>

            <div className="text-sm text-gray-600 font-medium">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="gap-2"
            >
              Next
              <Icons name="move-right" svgProps={{}} />
            </Button>
          </div>
        </>
      ) : (
        <TableEmptyState
          title="No payment history found."
          description="Your payment and transaction history will appear here once you start using paid features."
        />
      )}
    </div>
  );
}
