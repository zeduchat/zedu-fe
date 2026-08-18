import React, { useContext, useState, useEffect, useRef } from "react";
import { useDebounce } from "use-debounce";
import {
  useReactTable,
  getCoreRowModel,
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
import { Button } from "~/components/ui/button";
import Icons from "~/app/(client)/[org]/_components/billing/icons";
import { cn } from "~/lib/utils";
import Image from "next/image";
import images from "~/assets/images";
import TableEmptyState from "../table-empty-state";
import { Member } from "./type";
import { Pencil, Search, Trash2, UserCheck } from "lucide-react";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import EditMemberRoleModal from "./edit-member-role-modal";
import RestrictMemberModal from "./restrict-user-access-modal";
import { DataContext } from "~/store/GlobalState";
import Loading from "~/components/ui/loading";
import { RequirePermission } from "~/components/rbac/RequirePermission";
import { useRBAC } from "~/hooks/useRBAC";

interface MembersTableProps {
  membersData: Member[];
  isLoading: boolean;
  onSearchChange: (value: string) => void;
  onRoleChange: (value: string) => void;
  onMemberRoleUpdated?: (memberId: string, roleName: string) => void;
  pagination: {
    pageIndex: number;
    pageSize: number;
    pageCount: number;
    setPage: (index: number) => void;
    setPageSize: (size: number) => void;
  };
}

export default function MembersTable({
  membersData = [],
  isLoading = false,
  onSearchChange,
  onRoleChange,
  onMemberRoleUpdated,
  pagination,
}: MembersTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [isOpenEditMemberModal, setIsOpenEditMemberModal] =
    useState<boolean>(false);
  const [isOpenRestrictMemberModal, setIsOpenRestrictMemberModal] =
    useState<boolean>(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  const [searchValue, setSearchValue] = useState("");
  const [debouncedSearchValue] = useDebounce(searchValue, 500);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    onSearchChange(debouncedSearchValue);
  }, [debouncedSearchValue]);

  const { state } = useContext(DataContext);
  const { orgRoles } = state;
  const { hasPermission } = useRBAC();
  const canChangeRole = hasPermission("change:user_org_role");
  const canManageMembers =
    hasPermission("remove:people") || hasPermission("manage:members");
  const showMemberActions = canChangeRole || canManageMembers;

  const columns: ColumnDef<Member>[] = [
    {
      accessorKey: "email",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-medium hover:bg-transparent text-[#667085]"
        >
          Email Address
          <Icons name="move-down" svgProps={{}} />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-4">
          <div className="rounded-md h-[30px] w-[30px] overflow-hidden">
            <Image
              src={
                row.original.avatar_url ||
                row.original.default_avatar_url ||
                images?.user
              }
              alt=""
              width={40}
              height={40}
              className="w-full h-full object-cover"
            />
          </div>
          <span className="text-gray-700">{row.original.email}</span>
        </div>
      ),
    },
    {
      accessorKey: "role",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-medium hover:bg-transparent text-[#667085]"
        >
          Role
          <Icons name="move-down" svgProps={{}} />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="text-gray-700">{row.getValue("role") || "N/A"}</span>
      ),
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-medium hover:bg-transparent text-[#667085]"
        >
          Date Joined
          <Icons name="move-down" svgProps={{}} />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="text-gray-700">
          {new Date(row.original.created_at).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-medium hover:bg-transparent text-[#667085]"
        >
          Status
          <Icons name="move-down" svgProps={{}} />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex gap-1 w-fit px-2 py-1 rounded-md items-center border-2",
              {
                "border-green-100 text-green-700":
                  row.original.status === "active",
                "border-red-100 text-red-700":
                  row.original.status === "inactive",
                "border-blue-100 text-blue-700":
                  row.original.status === "invited",
                "border-yellow-100 text-yellow-700":
                  row.original.status === "pending",
                "border-gray-100 text-gray-700":
                  row.original.status === "deactivated",
              }
            )}
          >
            <div
              className={cn("w-2 h-2 rounded-full", {
                "bg-red-500": row.original.status === "inactive",
                "bg-green-500": row.original.status === "active",
                "bg-blue-500": row.original.status === "invited",
                "bg-yellow-500": row.original.status === "pending",
                "bg-gray-500": row.original.status === "deactivated",
              })}
            />
            <span className="capitalize text-xs">{row.original.status}</span>
          </div>
        </div>
      ),
    },
    ...(showMemberActions
      ? [
          {
            accessorKey: "action",
            header: () => (
              <div className="text-[#667085] font-medium">Actions</div>
            ),
            cell: ({ row }: { row: { original: Member } }) => (
              <div className="flex items-center gap-3">
                {canChangeRole && (
                  <Button
                    variant="outline"
                    className="text-gray-700 h-fit p-1"
                    onClick={() => {
                      setIsOpenEditMemberModal(true);
                      setSelectedMember(row.original);
                    }}
                  >
                    <Pencil size={20} />
                  </Button>
                )}
                {canManageMembers && (
                  <Button
                    variant="outline"
                    className={cn(
                      "h-fit p-1",
                      row.original.status === "inactive"
                        ? "text-green-700"
                        : "text-gray-700"
                    )}
                    onClick={() => {
                      setIsOpenRestrictMemberModal(true);
                      setSelectedMember(row.original);
                    }}
                  >
                    {row.original.status === "inactive" ? (
                      <UserCheck size={20} />
                    ) : (
                      <Trash2 size={20} />
                    )}
                  </Button>
                )}
              </div>
            ),
          } as ColumnDef<Member>,
        ]
      : []),
  ];

  const table = useReactTable({
    data: membersData,
    columns,
    pageCount: pagination.pageCount,
    state: {
      sorting,
      columnFilters,
      pagination: {
        pageIndex: pagination.pageIndex,
        pageSize: pagination.pageSize,
      },
    },
    onPaginationChange: (updater) => {
      const nextState =
        typeof updater === "function"
          ? updater({
              pageIndex: pagination.pageIndex,
              pageSize: pagination.pageSize,
            })
          : updater;

      if (nextState.pageIndex !== pagination.pageIndex) {
        pagination.setPage(nextState.pageIndex);
      }
      if (nextState.pageSize !== pagination.pageSize) {
        pagination.setPageSize(nextState.pageSize);
      }
    },
    manualPagination: true,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
  });

  const currentPage = pagination.pageIndex + 1;
  const totalPages = pagination.pageCount;

  if (isLoading) {
    return (
      <div className="w-full bg-white border mt-6 rounded-xl overflow-hidden py-16 flex justify-center items-center">
        <Loading color="blue" />
      </div>
    );
  }

  return (
    <div className="w-full mx-auto bg-white border mt-6 rounded-xl overflow-hidden">
      <EditMemberRoleModal
        isOpen={isOpenEditMemberModal}
        onClose={() => setIsOpenEditMemberModal(false)}
        selectedMember={selectedMember}
        onMemberRoleUpdated={onMemberRoleUpdated}
      />
      <RestrictMemberModal
        isOpen={isOpenRestrictMemberModal}
        onClose={() => setIsOpenRestrictMemberModal(false)}
        selectedMember={selectedMember}
      />

      <div className="flex items-center justify-between px-6 py-4 border-b">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
              size={16}
            />
            <Input
              placeholder="Search by name or email"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="pl-10 w-[300px]"
            />
          </div>
          <Select
            value={
              (table.getColumn("role")?.getFilterValue() as string) ?? "all"
            }
            onValueChange={(v) => {
              const val = v === "all" ? "" : v;
              table.getColumn("role")?.setFilterValue(val);
              onRoleChange(val);
            }}
          >
            <SelectTrigger className="w-fit gap-3">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              {orgRoles?.map((role: any) => (
                <SelectItem key={role.id} value={role.name.toLowerCase()}>
                  {role.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      {membersData.length > 0 || searchValue !== "" ? (
        <>
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((hg) => (
                <TableRow key={hg.id} className="bg-gray-50">
                  {hg.headers.map((h) => (
                    <TableHead key={h.id}>
                      {flexRender(h.column.columnDef.header, h.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
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
                    No members found for "{searchValue}"
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          <div className="flex items-center justify-between px-6 py-4 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="gap-2"
            >
              <Icons name="move-left" svgProps={{}} /> Previous
            </Button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (pageNum) => (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => table.setPageIndex(pageNum - 1)}
                    className="w-8 h-8 p-0"
                  >
                    {pageNum}
                  </Button>
                )
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="gap-2"
            >
              Next <Icons name="move-right" svgProps={{}} />
            </Button>
          </div>
        </>
      ) : (
        <TableEmptyState
          title="No members found."
          description="Your members will appear here once you invite them."
        />
      )}
    </div>
  );
}
