"use client";

import { ArrowDown, ArrowRight, ArrowLeft } from "lucide-react";
import React, { useContext, useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import { usageDetails } from "../../constants/usageDetails";
import { DataContext } from "~/store/GlobalState";

/* eslint-disable */

function getPaginationRange(currentPage: number, totalPages: number) {
  const range = [];
  const delta = 2;

  const start = Math.max(2, currentPage - delta);
  const end = Math.min(totalPages - 1, currentPage + delta);

  range.push(1);
  if (start > 2) range.push("...");

  for (let i = start; i <= end; i++) {
    range.push(i);
  }

  if (end < totalPages - 1) range.push("...");
  if (totalPages > 1) range.push(totalPages);

  return range;
}

export default function AgentUsage() {
  const [selectedOption, setSelectedOption] = useState("All");
  const itemsPerPage = 7;
  const [currentPage, setCurrentPage] = useState(1);
  const { state } = useContext(DataContext);
  const [filteredUsage, setFilteredUsage] = useState(
    structuredClone(usageDetails)
  );

  const paginatedUsage = filteredUsage.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
    if (selectedOption === "All") {
      setFilteredUsage(structuredClone(usageDetails));
    } else {
      const filtered = usageDetails.filter(
        (detail) => detail.type === selectedOption
      );
      setFilteredUsage(filtered);
    }
  }, [selectedOption]);

  const totalTasks = filteredUsage.length;

  const totalCost = filteredUsage
    .reduce((acc, curr) => acc + curr.cost, 0)
    .toFixed(2);

  const userFrequency: Record<string, number> = {};
  const channelFrequency: Record<string, number> = {};

  filteredUsage.forEach(({ user, channel }) => {
    if (user) {
      userFrequency[user] = (userFrequency[user] || 0) + 1;
    }
    if (channel) {
      channelFrequency[channel] = (channelFrequency[channel] || 0) + 1;
    }
  });

  const mostActiveUser = Object.entries(userFrequency).sort(
    (a, b) => b[1] - a[1]
  )[0][0];
  const mostActiveChannel = Object.entries(channelFrequency).sort(
    (a, b) => b[1] - a[1]
  )[0][0];

  return (
    <div className="pb-4 w-full overflow-x-auto">
      <div className="p-5 bg-white border border-[#E6EAEF] rounded-lg shadow-sm my-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="border-b sm:border-b-0 sm:border-r border-[#E6EAEF] pb-4 sm:pb-0 sm:pr-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#F5A30B] rounded-full"></div>
              <span className="text-[#667085] text-sm font-normal">
                Total Tasks Run
              </span>
            </div>
            <p className="text-[#344054] text-sm mt-1 font-semibold">
              {totalTasks}
            </p>
          </div>
          <div className="border-b sm:border-b-0 sm:border-r border-[#E6EAEF] pb-4 sm:pb-0 sm:px-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#7086FD] rounded-full"></div>
              <span className="text-[#667085] text-sm font-normal">
                Total Cost
              </span>
            </div>
            <p className="text-[#344054] text-sm mt-1 font-semibold">
              ${totalCost}
            </p>
          </div>
          <div className="border-b sm:border-b-0 lg:border-r border-[#E6EAEF] pb-4 sm:pb-0 lg:px-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#14B8A6] rounded-full"></div>
              <span className="text-[#667085] text-sm font-normal">
                Most Active User
              </span>
            </div>
            <p className="text-[#344054] text-sm mt-1 font-semibold">
              {mostActiveUser}
            </p>
          </div>
          <div className="lg:px-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#34A7BF] rounded-full"></div>
              <span className="text-[#667085] text-sm font-normal">
                Most Active Channel
              </span>
            </div>
            <p className="text-[#344054] text-sm mt-1 font-semibold">
              {mostActiveChannel}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-[#E6EAEF] rounded-lg shadow-sm my-4">
        <div className="flex justify-between items-center p-5">
          <h2 className="text-xl font-medium">
            Usage in {state?.orgData?.name}
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="bg-[#f6f7f9] text-[#667085]">
                <th className="px-5 py-4 text-left text-sm font-normal">
                  Type
                </th>
                <th className="px-5 py-4 text-left text-sm font-normal">
                  Name / Owner
                </th>
                <th className="px-5 py-4 text-left text-sm font-normal">
                  <div className="flex items-center gap-1">
                    <span>No. of Tasks</span>
                    <ArrowDown className="text-[#98A2B3] w-4 h-4" />
                  </div>
                </th>
                <th className="px-5 py-4 text-left text-sm font-normal">
                  <div className="flex items-center gap-1">
                    <span>Cost</span>
                    <ArrowDown className="text-[#98A2B3] w-4 h-4" />
                  </div>
                </th>
                <th className="px-5 py-4 text-left text-sm font-normal">
                  <div className="flex items-center gap-1">
                    <span>Last Used</span>
                    <ArrowDown className="text-[#98A2B3] w-4 h-4" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsage.map((detail, index) => (
                <tr
                  key={index}
                  className="border-t border-[#E6EAEF] text-[#344054] text-sm"
                >
                  <td className="px-5 py-3">{detail.type}</td>
                  <td className="px-5 py-3">
                    {detail.channel && (
                      <span className="border border-[#E6EAEF] rounded-md p-1 inline-block">
                        {detail.channel}
                      </span>
                    )}
                    {detail.user && (
                      <span className="inline-block rounded-md bg-[#F1F1FE] text-[#7141F8] p-1">
                        {detail.user}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3">{detail.taskNumber}</td>
                  <td className="px-5 py-3">${detail.cost}</td>
                  <td className="px-5 py-3">{detail.lastUsed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-5 border-t border-[#E6EAEF]">
          <Button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            variant="outline"
            className="w-full sm:w-auto"
          >
            <ArrowLeft className="text-[#667085] w-4 h-4" /> Previous
          </Button>

          <div className="flex flex-wrap justify-center gap-2">
            {getPaginationRange(
              currentPage,
              Math.ceil(filteredUsage.length / itemsPerPage)
            ).map((page, idx) => (
              <button
                key={idx}
                className={`px-3 py-1 rounded ${
                  page === currentPage
                    ? "bg-[#E6EAEF] font-medium"
                    : "hover:bg-gray-100"
                } ${page === "..." ? "cursor-default" : "cursor-pointer"}`}
                onClick={() => typeof page === "number" && setCurrentPage(page)}
                disabled={page === "..."}
              >
                {page}
              </button>
            ))}
          </div>

          <Button
            onClick={() =>
              setCurrentPage((prev) =>
                prev < Math.ceil(filteredUsage.length / itemsPerPage)
                  ? prev + 1
                  : prev
              )
            }
            disabled={
              currentPage === Math.ceil(filteredUsage.length / itemsPerPage)
            }
            variant="outline"
            className="w-full sm:w-auto flex items-center gap-1"
          >
            Next <ArrowRight className="text-[#667085] w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
