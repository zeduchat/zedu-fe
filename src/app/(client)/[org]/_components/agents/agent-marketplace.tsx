"use client";

import { useContext, useState } from "react";
import { ArrowRight } from "lucide-react";
import { DataContext } from "~/store/GlobalState";
import { useRouter } from "next/navigation";
import FallbackImage from "~/components/layout/fallback-image";

// const bullets = [
//   "Detect slow loading times, API failures, and performance dips.",
//   "Alert teams instantly if an outage, crash, or slowdown is detected.",
//   "Send real-time alerts from Zedu agents to Slack channels.",
//   "Notify specific team members using mentions when necessary.",
// ];

const AgentsMarketPlace = () => {
  const [activeIndexes, setActiveIndexes] = useState<number[]>([]);
  const { state } = useContext(DataContext);
  const { orgSlug } = state;
  const router = useRouter();

  const handleRoute = (item: any) => {
    router.push(`/${orgSlug}/colleagues/browse/${item.id}`);
  };

  //

  return (
    <div className="p-6 h-[calc(100vh-140px)] overflow-y-scroll bg-gradient-to-b from-[#F4F4FB] to-white">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
        {state?.marketPlaceAgents?.map((agent: any, index: number) => {
          const isActive = activeIndexes.includes(index);

          //

          return (
            <div
              key={index}
              className={`transition-all duration-300 border rounded-xl bg-white shadow-sm hover:border-primary-400 cursor-pointer ${
                isActive ? "ring-1 ring-[#D0D0FD]" : ""
              }`}
            >
              {/* Header */}
              <div
                onClick={() => handleRoute(agent)}
                className="flex items-center justify-between p-3 border-b"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`relative h-9 w-9 rounded-[7px] flex items-center justify-center border border-[#E6EAEF]`}
                  >
                    <FallbackImage
                      src={agent?.avatar}
                      alt="colleague"
                      userType="bot"
                      className="w-8 h-8 object-cover rounded-[7px]"
                    />

                    <div className="absolute -bottom-[3px] -right-[3px] w-[10px] h-[10px] bg-[#6DC347] rounded-full border border-white" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-[#344054]">
                      {agent.name}
                    </h2>
                  </div>
                </div>
                <div className="text-xs text-[#667085] border border-[#D0D5DD] rounded-full w-8 h-8 rounded-full flex items-center justify-center">
                  <ArrowRight size={18} />
                </div>
              </div>

              <div
                onClick={() =>
                  setActiveIndexes((prev) =>
                    prev.includes(index)
                      ? prev.filter((i) => i !== index)
                      : [...prev, index]
                  )
                }
              >
                <p className="mt-2 text-sm text-[#475467] px-3 ">
                  {agent.description}
                </p>

                <div
                  className={`transition-[max-height] duration-300 ease-in-out overflow-hidden mt-3 ${
                    isActive ? "max-h-[500px]" : "max-h-0"
                  }`}
                >
                  {/* <ul className="space-y-2 text-sm text-[#475467] px-3">
                    {bullets.map((bullet, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="w-4 h-4 mt-[2px] text-gray-500" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul> */}

                  {/* <div className="mt-4 py-3 border-t text-xs text-[#667085] text-center">
                    Used by 30+ companies in simplifying their workflow
                  </div> */}
                </div>

                <div className="mt-4 py-3 border-t text-xs text-[#667085] text-center">
                  Used by 30+ companies in simplifying their workflow
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AgentsMarketPlace;
