"use client";

import Image from "next/image";
import { ExternalLink, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { useContext, useState, useEffect } from "react";
import { search } from "~/utils/filter";
import { DataContext } from "~/store/GlobalState";
import { Member } from "~/types/people";
import images from "~/assets/images";
import { PostRequest } from "~/utils/new-request";
import { useRouter } from "next/navigation";

const SkeletonCard = () => (
  <div className="border border-gray-200 rounded-lg overflow-hidden animate-pulse flex-1 min-w-[200px] max-w-[280px]">
    <div className="aspect-square bg-gray-200" />
    <div className="p-3 bg-white space-y-2">
      <div className="h-4 bg-gray-200 rounded w-3/4" />
      <div className="h-3 bg-gray-100 rounded w-1/2" />
      <div className="h-3 bg-gray-50 rounded w-5/6" />
    </div>
  </div>
);

export default function PeopleTab() {
  const { state } = useContext(DataContext);
  const { channelloading, orgMembers, orgSlug } = state;
  const router = useRouter();

  const [searchInput, setSearchInput] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchInput]);

  if (channelloading || !orgMembers) {
    return (
      <div className="flex flex-wrap gap-4 p-5">
        {[...Array(10)].map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  const handleRoute = async (data: any) => {
    localStorage.setItem("channelName", data?.name);

    const orgId = localStorage.getItem("orgId") || "";

    const payload = {
      chat_type: data?.entity_type,
      participant_id: data?.id,
    };

    const res = await PostRequest(`/organisations/${orgId}/dms`, payload);

    if (res?.status === 200 || res?.status === 201) {
      router.push(
        `/${orgSlug}/people/${res?.data?.data?.channel_id}/${res?.data?.data?.participant_id}`
      );
    }
  };

  const filteredMembers = search(orgMembers || [], searchInput);

  const totalItems = filteredMembers?.length || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedMembers = filteredMembers?.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  //

  return (
    <div className="p-5 h-[80vh] overflow-y-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 group">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search
              size={18}
              className="text-gray-400 group-focus-within:text-black"
            />
          </div>
          <input
            type="text"
            placeholder="Search for people"
            className="w-full pl-10 pr-4 py-1.5 border border-gray-300 rounded focus:border-[#1264a3] focus:ring-1 focus:ring-blue-100 focus:outline-none text-[15px]"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
        {/* <CreateChannelDialog /> */}
      </div>

      <div className="flex  flex-wrap mx-auto gap-4">
        {paginatedMembers?.length > 0 ? (
          paginatedMembers.map((user: Member, index: number) => {
            return (
              <div
                key={user.id || index}
                className="border border-gray-200 rounded-lg overflow-hidden flex flex-col group cursor-pointer hover:shadow-md transition-shadow bg-white flex-grow flex-shrink basis-[150px] sm:max-w-[170px]"
                onClick={() => handleRoute(user)}
              >
                <div className="aspect-square relative overflow-hidden bg-gray-100">
                  <Image
                    src={
                      user.avatar_url || user.default_avatar_url || images?.user
                    }
                    alt={user.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 280px"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    unoptimized
                  />
                </div>
                <div className="p-3">
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-[15px] truncate">
                      {user.name}
                    </span>
                    <ExternalLink
                      size={12}
                      className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                  </div>
                  <p className="text-[13px] text-gray-500 mt-0.5 line-clamp-1">
                    {user.email}
                  </p>
                  {user.phone_number && (
                    <p className="text-[13px] text-gray-500 mt-1">
                      {user.phone_number}
                    </p>
                  )}
                  <div className="mt-2 flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        user.online ? "bg-green-500" : "bg-gray-300"
                      }`}
                      title={user.online ? "Online" : "Offline"}
                    />
                    <span className="text-[12px] text-gray-600">
                      {user.online ? "Online" : "Offline"}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="w-full py-20 text-center text-gray-500 italic">
            No members found matching your search.
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center md:justify-between px-2 py-6 border-t border-gray-100 mt-6 flex-wrap gap-4">
          <span className="text-[13px] text-gray-500">
            Showing{" "}
            <span className="font-medium text-black">{startIndex + 1}</span> to{" "}
            <span className="font-medium text-black">
              {Math.min(startIndex + itemsPerPage, totalItems)}
            </span>{" "}
            of <span className="font-medium text-black">{totalItems}</span>{" "}
            members
          </span>
          <div className="flex gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
              className="p-2 border border-gray-300 rounded-md disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="flex items-center px-3 text-[13px] font-medium">
              Page {currentPage} of {totalPages}
            </div>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => prev + 1)}
              className="p-2 border border-gray-300 rounded-md disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
