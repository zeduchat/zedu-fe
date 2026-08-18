"use client";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useContext } from "react";
import FallbackImage from "~/components/layout/fallback-image";
import { DataContext } from "~/store/GlobalState";

export default function InActiveColleagues() {
  const router = useRouter();
  const { state } = useContext(DataContext);
  const { orgSlug } = state;

  const handleRoute = (item: any) => {
    router.push(`/${orgSlug}/home/colleagues/browse/${item.id}`);
  };

  //

  return (
    <div className="bg-white p-6 w-full">
      <h2 className="text-gray-800 text-base font-semibold mb-4">
        Inactive Colleague
      </h2>

      <div className="overflow-x-auto -mx-6 sm:mx-0">
        <div className="inline-block min-w-full align-middle sm:px-0 px-6">
          <div className="overflow-hidden border rounded-xl">
            <table className="min-w-full divide-y divide-gray-200 table-auto text-sm text-left text-gray-700">
              <thead>
                <tr className="bg-gray-100 text-gray-500 text-xs">
                  <th className="py-4 px-3 sm:px-4 font-medium">Name</th>
                  <th className="py-4 px-3 sm:px-4 font-medium hidden sm:table-cell">
                    Channels
                  </th>
                  <th className="py-4 px-3 sm:px-4 font-medium hidden md:table-cell">
                    April Usage
                  </th>
                  <th className="py-4 px-3 sm:px-4 font-medium"></th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {state?.inactiveAgents.map((agent: any) => (
                  <tr key={agent.id} className="hover:bg-gray-50 transition">
                    <td className="py-3 px-3 sm:px-4">
                      <div className="flex items-center gap-3">
                        <FallbackImage
                          src={agent?.avatar}
                          alt="colleague"
                          userType="bot"
                          className="w-[36px] h-[36px] border rounded min-w-[36px]"
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {agent.name}
                          </p>
                          <p className="text-xs text-gray-500 truncate max-w-[200px] sm:max-w-[300px]">
                            {agent.description}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 sm:px-4 hidden sm:table-cell">
                      <div className="flex gap-2 flex-wrap">
                        <span className="text-gray-700 text-xs px-2.5 py-1 rounded-lg border">
                          channel-1
                        </span>
                        <span className="text-gray-700 text-xs px-2.5 py-1 rounded-lg border hidden md:inline-block">
                          channel-2
                        </span>
                        <span className="text-gray-700 text-xs px-2.5 py-1 rounded-full border">
                          +3
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3 sm:px-4 font-medium text-gray-900 hidden md:table-cell">
                      $12
                    </td>
                    <td className="py-3 px-3 sm:px-4">
                      <div
                        onClick={() => handleRoute(agent)}
                        className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-gray-100 cursor-pointer"
                      >
                        <ArrowRight className="w-4 h-4 text-gray-400" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {state?.inactiveAgents?.length === 0 && (
            <p className="text-center mt-20 text-gray-400 text-sm">
              You have no inactive colleague
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
