"use client";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useContext } from "react";
import FallbackImage from "~/components/layout/fallback-image";
import Loading from "~/components/ui/loading";
import { DataContext } from "~/store/GlobalState";

export default function ActiveColleagues() {
  const router = useRouter();
  const { state } = useContext(DataContext);
  const { orgSlug } = state;

  const handleRoute = (item: any) => {
    router.push(`/${orgSlug}/home/colleagues/browse/${item.id}`);
  };

  //

  return (
    <div className="bg-white py-6 px-4 w-full">
      {state?.integrationsLoading ? (
        <div className="flex items-center justify-center mt-20">
          <Loading width="40" height="40" color="blue" />
        </div>
      ) : (
        <>
          <h2 className="text-gray-800 text-base font-semibold mb-4">
            Active Colleagues
          </h2>

          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              <table className="w-full border rounded-xl table-auto text-sm text-left text-gray-700">
                <thead>
                  <tr className="bg-gray-100 text-gray-500 border-b text-xs py-10">
                    <th className="py-4 px-4 font-medium">Name</th>
                    <th className="py-4 px-4 font-medium">Channels</th>
                    <th className="py-4 px-4 font-medium">April Usage</th>
                    <th className="py-4 px-4 font-medium"></th>
                  </tr>
                </thead>

                <tbody>
                  {state?.activeAgents.map((agent: any) => (
                    <tr
                      key={agent.id}
                      className="border-b last:border-none hover:bg-gray-50 transition"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <FallbackImage
                            src={agent?.avatar}
                            alt="colleague"
                            userType="bot"
                            className="w-[36px] h-[36px] border rounded min-w-[36px]"
                          />

                          <div className="min-w-[200px]">
                            <p className="text-sm font-medium text-gray-900">
                              {agent.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {agent.description?.length > 70
                                ? agent.description.slice(0, 70) + "..."
                                : agent.description}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2 flex-wrap min-w-[200px]">
                          <span className="text-gray-700 text-xs px-2.5 py-1 rounded-lg border">
                            channel-1
                          </span>
                          <span className="text-gray-700 text-xs px-2.5 py-1 rounded-lg border">
                            channel-2
                          </span>

                          <span className="text-gray-700 text-xs px-2.5 py-1 rounded-full border">
                            +3
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-medium text-gray-900">
                        {/* {agent.usage} */} $12
                      </td>
                      <td className="py-3 px-4">
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

            {state?.activeAgents?.length === 0 && (
              <p className="text-center mt-20 text-gray-400 text-sm">
                You have no active integration
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
