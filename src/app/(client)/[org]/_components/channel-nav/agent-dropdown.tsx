import { Check, Search } from "lucide-react";
import React, { useContext, useState } from "react";
import { Input } from "~/components/ui/input";
import images from "~/assets/images";
import Image from "next/image";
import { Button } from "~/components/ui/button";
import { useParams, useRouter } from "next/navigation";
import { PostRequest } from "~/utils/new-request";
import { search } from "~/utils/filter";
import { DataContext } from "~/store/GlobalState";

interface AgentDropdownProps {
  isOpen: boolean;
  agents: any;
  showModal: any;
  setCallback: any;
  callback: boolean;
}

const AgentDropdown = ({
  isOpen,
  agents,
  showModal,
  setCallback,
  callback,
}: AgentDropdownProps) => {
  const router = useRouter();
  const params = useParams();
  const channelId = params.id as string;
  const [searchInput, setSearchInput] = useState("");
  const { state } = useContext(DataContext);
  const { orgSlug } = state;

  // Track active agents (for toggling)
  const [selectedAgents, setSelectedAgents] = useState(
    agents.filter((agent: any) => agent.is_active).map((agent: any) => agent.id)
  );

  // Toggle agent activation
  const toggleAgentActivation = async (agent: any) => {
    const orgId = localStorage.getItem("orgId") || "";

    const isActivating = !selectedAgents.includes(agent?.id);
    setSelectedAgents((prev: any) =>
      isActivating
        ? [...prev, agent?.id]
        : prev.filter((id: string) => id !== agent?.id)
    );

    await PostRequest(
      `/organisations/${orgId}/agents/${agent?.id}/channels/${channelId}`,
      { status: agent?.is_active ? false : true }
    );
    setCallback(!callback);
  };

  const searchData = search(agents, searchInput);

  if (!isOpen) return null;

  return (
    <div className="absolute top-full right-0 mt-2.5 w-[339px] bg-white rounded-[7px] shadow-lg border border-[#E6EAEF] z-20">
      <div className="p-3 border-b border-[#E6EAEF] overflow-hidden">
        <div className="flex items-center p-[10px] gap-2 border border-[#E6EAEF] rounded-[6px] h-10">
          <Search className="w-5 h-5 text-[#667085]" />
          <Input
            placeholder="Find an agent"
            className="w-full border-none p-0 h-full"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
      </div>

      {agents.length === 0 ? (
        <div className="py-5 text-[15px] px-3 text-center">
          You have no activated agents
        </div>
      ) : (
        <div className="pt-3 px-3 pb-[6px] max-h-[200px] overflow-y-auto">
          <h3 className="text-blue-500 font-semibold text-[13px] mb-2">
            Activated Agents
          </h3>

          {searchData?.map((agent: any) => {
            return (
              <div
                key={agent.id}
                className="flex items-center justify-between py-[10px] hover:bg-gray-50 cursor-pointer"
                onClick={() => toggleAgentActivation(agent)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-sm border border-[#E6EAEF] flex items-center justify-center relative bg-green-100">
                    <Image
                      src={agent?.app_logo || images?.bot}
                      alt={agent.app_name}
                      width={20}
                      height={20}
                    />
                  </div>
                  <p className="text-[13px] font-semibold text-[#344054]">
                    {agent.app_name}
                  </p>
                </div>
                <div
                  className={`w-5 h-5 rounded-full border ${
                    agent.is_active // Use agent.is_active here
                      ? "border-[#8686F9] bg-[#8686F9]"
                      : "border-[#E6EAEF]"
                  } flex items-center justify-center`}
                >
                  {agent.is_active && <Check className="w-3 h-3 text-white" />}{" "}
                  {/* Use agent.is_active here */}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="bg-[#F6F7F9] p-3 flex gap-10">
        <Button
          onClick={() => router.push(`/${orgSlug}/agents/browse-agents`)}
          variant="outline"
          className="w-full h-9"
        >
          <span>Browse Agents</span>
        </Button>
        <Button
          onClick={showModal}
          variant="default"
          className="w-full bg-[#7141F8] text-white h-9"
        >
          <span>Add New Agent</span>
        </Button>
      </div>
    </div>
  );
};

export default AgentDropdown;
