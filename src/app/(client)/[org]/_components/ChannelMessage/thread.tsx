import React from "react";
import UserAvatar from "~/components/layout/user-avatar";

const Thread = ({ item }: any) => {
  return (
    <div
      className={`relative bg-white group hover:bg-gray-50 py-2 transition-colors flex items-start px-3 mx-5 border-2 rounded-lg my-5 ${item?.status === "success" ? "border-[#00CC5F]" : "border-[#F81404]"}`}
    >
      <div className="min-w-8 mr-2 flex items-center justify-center">
        <UserAvatar item={item} size="md" />
      </div>

      <div>
        <div className="flex items-center gap-2">
          <span className="font-bold pb-1 text-[15px] text-[#1D2939]">
            {item?.username}
          </span>

          <span className="text-xs text-[#98A2B3]">
            {new Date(item?.created_at).toLocaleTimeString([], {
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            })}
          </span>
        </div>

        <div className="relative flex items-start justify-between">
          <div className="gap-2">
            <small className="text-sm font-bold text-neutral-700">
              {item?.event_name}
            </small>

            <small className="text-sm text-neutral-500 mb-1">
              {item?.message.split("\\n").map((line: string, index: number) => {
                const match = line.match(/^(.*?):\s*(.*)$/);
                return (
                  <p
                    key={index}
                    style={{
                      whiteSpace: "pre-line",
                      wordBreak: "break-word",
                      overflowWrap: "break-word",
                    }}
                    className="mb-1"
                  >
                    {match ? (
                      <>
                        <strong>{match[1]}:</strong> &nbsp;&nbsp; {match[2]}
                      </>
                    ) : (
                      line
                    )}
                  </p>
                );
              })}
            </small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Thread;
