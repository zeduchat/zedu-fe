"use client";

import moment from "moment";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import TableEmptyState from "../table-empty-state";
import Loading from "~/components/ui/loading";
import { cn } from "~/lib/utils";
import type { WebhookHistoryItem } from "~/types/webhook";

interface WebhookHistoryTableProps {
  history: WebhookHistoryItem[];
  isLoading?: boolean;
  compact?: boolean;
}

export default function WebhookHistoryTable({
  history,
  isLoading = false,
  compact = false,
}: WebhookHistoryTableProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loading color="#5757CD" height="28px" width="28px" />
      </div>
    );
  }

  if (!history.length) {
    return (
      <TableEmptyState
        title="No delivery history yet"
        description="Webhook attempts will appear here once external services post to your URL."
      />
    );
  }

  return (
    <div
      className={cn(
        "rounded-xl border border-[#E6EAEF] overflow-hidden bg-white",
        compact && "text-sm"
      )}
    >
      <Table>
        <TableHeader>
          <TableRow className="bg-[#F9FAFB] hover:bg-[#F9FAFB]">
            <TableHead className="text-[#667085] font-semibold">
              Attempted
            </TableHead>
            <TableHead className="text-[#667085] font-semibold">
              Action
            </TableHead>
            <TableHead className="text-[#667085] font-semibold">
              Status
            </TableHead>
            <TableHead className="text-[#667085] font-semibold">
              Retries
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {history.map((item) => (
            <TableRow key={item.id} className="hover:bg-[#F6F7F9]">
              <TableCell className="text-[#344054] font-medium">
                {moment(item.attempted).format("MMM D, YYYY · h:mm A")}
              </TableCell>
              <TableCell>
                <span className="inline-flex capitalize px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#EEF4FF] text-[#3538CD]">
                  {item.action_type || "—"}
                </span>
              </TableCell>
              <TableCell>
                <span
                  className={cn(
                    "inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold",
                    String(item.status_code).startsWith("2")
                      ? "bg-[#ECFDF3] text-[#027A48]"
                      : "bg-[#FEF3F2] text-[#B42318]"
                  )}
                >
                  {item.status_code || "—"}
                </span>
              </TableCell>
              <TableCell className="text-[#667085]">
                {item.retries || "0"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
